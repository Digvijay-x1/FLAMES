import {mutation, MutationCtx, QueryCtx} from "./_generated/server";
import { v }  from "convex/values"

export const createUser = mutation({
    args: {
        username: v.string(),
        email: v.string(),
        fullName: v.string(),
        image: v.string(),
        bio: v.optional(v.string()),
        clerkId: v.string(),
    },

    handler: async(ctx,args) => {

        const existingUser = await ctx.db.query("users")
            .withIndex("by_clerk_id", (q)=>q.eq("clerkId",args.clerkId))
            .first()

        if (existingUser) return
        await ctx.db.insert("users",{
            username: args.username,
            fullName: args.fullName,
            email: args.email,
            bio: args.bio,
            image: args.image,
            clerkId: args.clerkId,
            followers: 0,
            following: 0,
            posts: 0
        })
    }
});

export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
    const identity = await ctx.auth.getUserIdentity();
    if(!identity) throw new Error("unauthorized");

    const currentUser = await ctx.db.query("users").withIndex("by_clerk_id", (q)=>q.eq("clerkId", identity.subject)).first();

    if (!currentUser) throw new Error("User not found");

    return currentUser;
}

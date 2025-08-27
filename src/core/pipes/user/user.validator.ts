import { z } from 'zod';

export class UserValidator {

    static check(name: string, bio: string, links: { label: string; url: string }[], avatarFile: File | null) {
        const nonEmptyLinks = this.checkLinks(links);
        let result = UiUserSchema.safeParse({
            name,
            bio,
            links: nonEmptyLinks.length > 0 ? nonEmptyLinks : undefined,
            avatar: avatarFile,
        });

        let errorList: { type: string, message: string }[] = [];

        if (!result.success) {
            for (const issue of result.error.issues) {
                const path0 = issue.path[0];
                if (path0 === 'name') errorList.push({ type: 'name', message: issue.message })
                if (path0 === 'links') {
                    const index = typeof issue.path[1] === 'number' ? (issue.path[1] as number) : undefined;
                    const field = issue.path[2];
                    if (typeof index === 'number' && field === 'url') {
                        errorList.push({ type: `link_${index}`, message: issue.message })
                    }
                }
                if (path0 === 'avatar') errorList.push({ type: 'avatar', message: issue.message })
            }
        };
        return {
            data: result.data,
            error: errorList
        }
    }

    private static checkLinks = (links: { label: string; url: string }[]) => {
        return links.map((l) => ({ ...l, url: l.url.trim() })).filter((l) => l.url.length > 0);
    };
}

export const UiUserSchema = z.object({
    name: z.string().trim().min(3, 'Name must be at least 3 characters'),
    bio: z.string().trim().optional(),
    links: z
        .array(
            z.object({
                label: z.string().min(1, 'Label is required'),
                url: z.string().trim().url('Invalid URL'),
            }),
        )
        .optional(),
    avatar: z
        .union([z.instanceof(File), z.null()])
        .refine((file) => file == null || file.type.startsWith('image/'), {
            message: 'Avatar must be an image file',
        })
        .optional(),
});
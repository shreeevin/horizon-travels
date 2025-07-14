import { ArrowUpRight, Github, Instagram, Linkedin, Twitter } from "lucide-react"

const Community = () => {
    return (
        <div className="w-full my-16">
            <h2 className="mb-5 text-2xl font-semibold md:text-3xl">
                Join our community
            </h2>
            <p className="font-medium text-muted-foreground md:text-xl">
                Connect with others, share experiences, and stay in the loop.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                <a className="group rounded-md border border-border p-6" href="https://x.com/horizon" target="_blank" rel="noopener noreferrer">
                    <div className="flex items-center justify-between gap-4">
                        <Twitter className="size-5" />
                        <ArrowUpRight className="size-4 -translate-x-2 translate-y-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
                    </div>
                    <div className="mt-4">
                        <h3 className="mb-1 font-semibold">Twitter</h3>
                        <p className="text-sm text-muted-foreground">
                            Follow our latest updates and announcements.
                        </p>
                    </div>
                </a>
                <a className="group rounded-md border border-border p-6" href="https://linkedin.com/company/horizon" target="_blank" rel="noopener noreferrer">
                    <div className="flex items-center justify-between gap-4">
                        <Linkedin className="size-5" />
                        <ArrowUpRight className="size-4 -translate-x-2 translate-y-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
                    </div>
                    <div className="mt-4">
                        <h3 className="mb-1 font-semibold">LinkedIn</h3>
                        <p className="text-sm text-muted-foreground">
                            Connect with us and explore career opportunities.
                        </p>
                    </div>
                </a>
                <a className="group rounded-md border border-border p-6" href="https://github.com/horizon" target="_blank" rel="noopener noreferrer">
                    <div className="flex items-center justify-between gap-4">
                        <Github className="size-5" />
                        <ArrowUpRight className="size-4 -translate-x-2 translate-y-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
                    </div>
                    <div className="mt-4">
                        <h3 className="mb-1 font-semibold">Github</h3>
                        <p className="text-sm text-muted-foreground">
                            Contribute to our open-source projects.
                        </p>
                    </div>
                </a>
                <a className="group rounded-md border border-border p-6" href="https://instagram.com/horizon" target="_blank" rel="noopener noreferrer">
                    <div className="flex items-center justify-between gap-4">
                        <Instagram className="size-5" />
                        <ArrowUpRight className="size-4 -translate-x-2 translate-y-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
                    </div>
                    <div className="mt-4">
                        <h3 className="mb-1 font-semibold">Instagram</h3>
                        <p className="text-sm text-muted-foreground">
                            Follow our latest updates and announcements.
                        </p>
                    </div>
                </a>
            </div>
        </div>
    )
}
export { Community }
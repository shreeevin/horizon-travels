export default function HeadingLarge({ title, description }: { title: string; description?: string }) {
    return (
        <header>
            <h1 className="mb-0.5 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">{title}</h1>
            {description && <p className="text-muted-foreground text-xl">{description}</p>}
        </header>
    );
}
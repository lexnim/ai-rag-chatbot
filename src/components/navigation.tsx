import { SignInButton, SignOutButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { ModeToggle } from "./ModeToggle";

export const Navigation = () => {
    return (
        <nav className="border-b border-(--foreground)/10">
            <div className="flex container h-16 items-center justify-between p-4 mx-auto">
                <div className="text-xl font-semibold">AI Chatbot</div>
                <div className="flex gap-2">
                    <SignedOut>
                        <SignInButton mode="modal">
                            <Button variant="ghost">Sign In</Button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                            <Button>Sign Up</Button>
                        </SignUpButton>
                    </SignedOut>

                    <SignedIn>
                        <SignOutButton>
                            <Button variant="outline">Sign Out</Button>
                        </SignOutButton>
                    </SignedIn>
                    <ModeToggle />
                </div>
            </div>
        </nav>
    )
}
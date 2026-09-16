import MembershipPage from "@/components/landing-ui/membership-page";
import PublicPage from "@/components/landing-ui/public-page";

export default function MembershipPackage() {
    return (
        <PublicPage>
            <MembershipPage />
        </PublicPage>
    )
}
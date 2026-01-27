// components/shared/Button/index.jsx
// Wrapper around shadcn Button for consistency
import { Button as ShadcnButton } from "../../ui/button";
import { cn } from "@/utils/utils";


export default function Button({ className, ...props }) {
    return <ShadcnButton className={cn(className)} {...props} />;
}



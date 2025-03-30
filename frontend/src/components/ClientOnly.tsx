import { useEffect, useState } from 'react';

export default function ClientOnly({ children }: { children: React.ReactNode }) {
    const [hasMounted, setHasMounted] = useState(false);

    // Only show the children after component is mounted on the client
    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        // You can render a skeleton/loader here if desired
        return null;
    }

    return <>{children}</>;
} 
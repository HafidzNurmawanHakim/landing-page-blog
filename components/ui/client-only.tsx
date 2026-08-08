// components/ClientOnly.tsx
import React, { useState, useEffect, ReactNode } from "react";

interface ClientOnlyProps {
  children: ReactNode;
  /**
   * Optional: A fallback element to render on the server or until the client mounts.
   * If not provided, nothing will be rendered until the client mounts.
   */
  fallback?: ReactNode;
}

const ClientOnly: React.FC<ClientOnlyProps> = ({
  children,
  fallback = null,
}) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default ClientOnly;

import { forwardRef } from 'react';
import { Link as RouterLink } from 'react-router';
import { LinkComponent, LinkComponentProps } from '@vibeflow/playground-ui';

export const Link: LinkComponent = forwardRef<HTMLAnchorElement, LinkComponentProps>(
  ({ children, href, ...props }, ref) => {
    return (
      <RouterLink ref={ref} to={href} {...props}>
        {children}
      </RouterLink>
    );
  },
);

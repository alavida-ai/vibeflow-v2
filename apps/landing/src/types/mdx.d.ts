declare module "*.mdx" {
  import { ComponentType } from 'react';
  
  interface MDXMetadata {
    title?: string;
    description?: string;
    order?: number;
    [key: string]: any;
  }

  const MDXComponent: ComponentType<any>;
  export const metadata: MDXMetadata;
  export default MDXComponent;
}

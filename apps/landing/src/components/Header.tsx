"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { FaGithub } from "react-icons/fa";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuIndicator,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    NavigationMenuViewport,
  } from "@/components/ui/navigation-menu"
import { Navbar2 } from './Navbar';

const Header = () => {
  return (
    <header className="w-full fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-800">
        {/* <div className='flex flex-row items-center gap-2'>
        <div className="flex flex-row items-center gap-2">
            <Image src="/Alavida.png" alt="VibeFlow" width={40} height={40} />
            <span className="text-2xl font-bold text-gray-800">/</span>
            <span className="text-2xl font-bold">VibeFlow</span>
        </div>
        <nav className="flex flex-grow justify-center">
            <NavigationMenu>
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <NavigationMenuLink asChild>
                            <Link href="/docs">Docs</Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink asChild>
                            <Link href="/components">Components</Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink asChild>
                            <Link href="/tools">Tools</Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink asChild>
                            <Link href="/roadmap">Roadmap</Link>
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </nav>
        </div>
        <div className='flex flex-row items-center gap-4'>
            <FaGithub className='text-gray-400' size={24} />
            <Button >
                Build in Public
            </Button>
        </div> */}
        <Navbar2 />
    </header>
  );
};

export default Header;
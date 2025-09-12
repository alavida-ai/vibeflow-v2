"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useState } from "react"

export const StrategyTabs = () => {
  const [activeTab, setActiveTab] = useState("content") 
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
    <TabsList className="w-full">
      <TabsTrigger
        value="content"
        className="hover:cursor-pointer"
      >
        Content Strategy
      </TabsTrigger>
      <TabsTrigger
        value="community"
        className="hover:cursor-pointer"
      >
        Community Building
      </TabsTrigger>
      <TabsTrigger
        value="product"
        className="hover:cursor-pointer"
      >
        Product-Led Growth
      </TabsTrigger>
      <TabsTrigger
        value="distribution"
        className="hover:cursor-pointer"
      >
        Distribution
      </TabsTrigger>
    </TabsList>

    <TabsContent value="content" className="mt-8">
      <div className="bg-background border border-border rounded-lg p-8">
        <h3 className="text-2xl font-bold mb-4">Content Strategy</h3>
        <p className="text-muted-foreground leading-relaxed">
          Open-source documentation and educational content that showcases real-world implementations.
        </p>
      </div>
    </TabsContent>

    <TabsContent value="community" className="mt-8">
      <div className="bg-background border border-border rounded-lg p-8">
        <h3 className="text-2xl font-bold mb-4">Community Building</h3>
        <p className="text-muted-foreground leading-relaxed">
          Transparent engagement and developer advocacy through collaborative development.
        </p>
      </div>
    </TabsContent>

    <TabsContent value="product" className="mt-8">
      <div className="bg-background border border-border rounded-lg p-8">
        <h3 className="text-2xl font-bold mb-4">Product-Led Growth</h3>
        <p className="text-muted-foreground leading-relaxed">
          Let the product speak for itself through quality and transparency.
        </p>
      </div>
    </TabsContent>

    <TabsContent value="distribution" className="mt-8">
      <div className="bg-background border border-border rounded-lg p-8">
        <h3 className="text-2xl font-bold mb-4">Distribution Channels</h3>
        <p className="text-muted-foreground leading-relaxed">
          Multi-channel approach to reach developers where they are.
        </p>
      </div>
    </TabsContent>
  </Tabs>
  )
}
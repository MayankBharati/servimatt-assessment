'use client';

import { useState } from 'react';
import { AppSidebar, ChatThread } from '@/components/app-sidebar';
import { AgentChat } from '@/components/agent-chat';
import { ErrorBoundary } from '@/components/error-boundary';
import { PersonalInfo } from '@/components/personal-info';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@workspace/ui/components/breadcrumb';
import { Separator } from '@workspace/ui/components/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@workspace/ui/components/sidebar';
import { MessageSquare } from 'lucide-react';

export default function Page() {
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [currentAgent, setCurrentAgent] = useState<any>(null);

  const handleAgentSelect = (agent: any) => {
    setCurrentAgent(agent);
    // Auto-select will be handled by AppSidebar passing the newest chat
  };

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '350px',
        } as React.CSSProperties
      }
    >
      <AppSidebar
        onThreadSelect={setSelectedThread}
        onAgentSelect={setCurrentAgent}
      />
      <SidebarInset>
        <header className="bg-background/75 backdrop-blur-2xl border-b sticky top-0 flex shrink-0 items-center gap-2 p-4 z-10">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#" className="gradient-text font-medium">
                  AI Nexus Chats
                </BreadcrumbLink>
              </BreadcrumbItem>
              {selectedThread && (
                <>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-medium">{selectedThread.title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center p-4">
          {selectedThread ? (
            <ErrorBoundary>
              <div className="w-full h-full max-w-4xl" key={selectedThread.id}>
                <AgentChat
                  chatId={selectedThread.id}
                  currentAgent={currentAgent}
                />
              </div>
            </ErrorBoundary>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-6 min-h-[400px] w-full">
              <PersonalInfo />
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

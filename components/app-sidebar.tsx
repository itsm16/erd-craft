"use client"

import * as React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

import { Button } from "@/components/ui/button"

import { Textarea } from "@/components/ui/textarea"

import { useFlowStore } from "@/store/flow-store"

import { useParams } from "next/navigation"

import { ErdResponse } from "@/lib/ai"

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const [aiPrompt, setAiPrompt] =
    React.useState("")

  const [loading, setLoading] =
    React.useState(false)

  const { canvasId: flowId } =
    useParams()

  const {
    erdText,
    nodes,
    edges,

    setErdText,

    syncFromErd,
  } = useFlowStore()

  const persistFlow = React.useCallback(() => {
    localStorage.setItem(
      `flow-${flowId}`,
      JSON.stringify({
        flowId,

        erdText:
          useFlowStore.getState().erdText,

        nodes:
          useFlowStore.getState().nodes,

        edges:
          useFlowStore.getState().edges,
      })
    )
  }, [flowId])

  const handleGenerateWithAi =
    async () => {
      setLoading(true)

      try {
        const response =
          await fetch(
            "/api/ai-response",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                prompt: aiPrompt,
              }),
            }
          ).then((res) => res.json())

        setErdText(response.response.erd)

        setTimeout(() => {
          persistFlow()
        }, 0)
      } catch (error) {
        console.log(error)

        setErdText(
          "Error generating ERD"
        )
      } finally {
        setLoading(false)
      }
    }

  return (
    <Sidebar
      collapsible="icon"
      {...props}
    >
      <SidebarHeader>
        <div className="space-y-2">
          <Textarea
            placeholder="Give school db schema..."
            value={aiPrompt}
            onChange={(e) =>
              setAiPrompt(
                e.target.value
              )
            }
          />

          <Button
            className="w-full"
            onClick={
              handleGenerateWithAi
            }
            disabled={loading}
          >
            {loading
              ? "Generating..."
              : "Generate with AI"}
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <div className="flex h-full flex-col gap-2 overflow-hidden">
          <div className="flex-1 overflow-hidden px-1">
            <Textarea
              className="h-full resize-none overflow-y-auto"
              value={erdText}
              onChange={(e) => {
                const text =
                  e.target.value

                setErdText(text)

                localStorage.setItem(
                  `flow-${flowId}`,
                  JSON.stringify({
                    flowId,

                    erdText: text,

                    nodes,
                    edges,
                  })
                )
              }}
            />
          </div>

          <Button
            className="m-1"
            onClick={() => {
              syncFromErd()

              setTimeout(() => {
                persistFlow()
              }, 0)
            }}
          >
            Sync Diagram
          </Button>
        </div>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
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

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const syncBtn = React.useRef<HTMLButtonElement>(null)
  
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
        const response = await fetch(
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
        )

        if (!response.body)
          throw new Error(
            "No response body"
          )

        const reader =
          response.body.getReader()
        const decoder = new TextDecoder()
        let erdAccumulated = ""
        let buffer = ""

        while (true) {
          const { done, value } =
            await reader.read()
          if (done) break

          buffer += decoder.decode(
            value,
            { stream: true }
          )
          const lines = buffer.split("\n")
          buffer = lines.pop() ?? ""

          for (const line of lines) {
            if (!line.trim()) continue

            try {
              const data = JSON.parse(line)
              if (data.error)
                throw new Error(data.error)

              if (data.text) {
                erdAccumulated += data.text
                setErdText(erdAccumulated)
                useFlowStore
                  .getState()
                  .syncFromErd()
              }
            } catch {
              // skip partial lines
            }
          }
        }
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
            ref={syncBtn}
          >
            Sync Diagram
          </Button>
        </div>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
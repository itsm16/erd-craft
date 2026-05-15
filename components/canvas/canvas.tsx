"use client"

import { useEffect, useCallback } from "react"

import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  NodeChange,
  EdgeChange,
  Connection,
  Background,
  BackgroundVariant,
  MiniMap,
  NodeTypes,
} from "@xyflow/react"

import "@xyflow/react/dist/style.css"

import { useFlowStore } from "@/store/flow-store"

import { SchemaNode } from "./schema-node"

const nodeTypes: NodeTypes = {
  schema: SchemaNode,
}

type CanvasProps = {
  flowId: string
}

export default function Canvas({
  flowId,
}: CanvasProps) {
  const {
    nodes,
    edges,

    setNodes,
    setEdges,

    loadFlow,
  } = useFlowStore()

  useEffect(() => {
    loadFlow(flowId)
  }, [flowId, loadFlow])

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const updatedNodes = applyNodeChanges(
        changes,
        nodes
      )

      setNodes(updatedNodes)

      localStorage.setItem(
        `flow-${flowId}`,
        JSON.stringify({
          flowId,

          erdText:
            useFlowStore.getState().erdText,

          nodes: updatedNodes,

          edges:
            useFlowStore.getState().edges,
        })
      )
    },
    [nodes, flowId, setNodes]
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const updatedEdges = applyEdgeChanges(
        changes,
        edges
      )

      setEdges(updatedEdges)

      localStorage.setItem(
        `flow-${flowId}`,
        JSON.stringify({
          flowId,

          erdText:
            useFlowStore.getState().erdText,

          nodes:
            useFlowStore.getState().nodes,

          edges: updatedEdges,
        })
      )
    },
    [edges, flowId, setEdges]
  )

  const onConnect = useCallback(
    (params: Connection) => {
      const updatedEdges = addEdge(
        params,
        edges
      )

      setEdges(updatedEdges)

      localStorage.setItem(
        `flow-${flowId}`,
        JSON.stringify({
          flowId,

          erdText:
            useFlowStore.getState().erdText,

          nodes:
            useFlowStore.getState().nodes,

          edges: updatedEdges,
        })
      )
    },
    [edges, flowId, setEdges]
  )

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        minZoom={0.5}
        maxZoom={2}
        fitView
      >
        <Background
          color="gray"
          variant={BackgroundVariant.Dots}
        />

        <MiniMap nodeStrokeWidth={3} />
      </ReactFlow>
    </div>
  )
}
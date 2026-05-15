import { create } from "zustand"

import {
  Edge,
  Node,
} from "@xyflow/react"

import { parseErd } from "@/lib/parse-erd"

type FlowStore = {
  flowId: string

  erdText: string

  nodes: Node[]
  edges: Edge[]

  setFlowId: (id: string) => void

  setErdText: (text: string) => void

  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void

  syncFromErd: () => void

  saveFlow: () => Promise<void>

  loadFlow: (id: string) => Promise<void>
}

export const useFlowStore = create<FlowStore>((set, get) => ({
  flowId: "",

  erdText: `user {
  id uuid pk
  name string
}

post {
  id uuid pk
  userId uuid fk > user.id
  title string
}`,

  nodes: [],

  edges: [],

  setFlowId: (id) => {
    set({
      flowId: id,
    })
  },

  setErdText: (text) => {
    set({
      erdText: text,
    })
  },

  setNodes: (nodes) => {
    set({
      nodes,
    })
  },

  setEdges: (edges) => {
    set({
      edges,
    })
  },

  syncFromErd: () => {
    const { erdText } = get()

    const parsed = parseErd(erdText)

    const nodes: Node[] = parsed.map(
      (table, index) => ({
        id: table.name,

        type: "schema",

        position: {
          x: index * 400,
          y: 100,
        },

        data: {
          tableName: table.name,
          fields: table.fields,
        },
      })
    )

    const edges: Edge[] = []

    parsed.forEach((table) => {
      table.fields.forEach((field) => {
        if (!field.relation) return

        edges.push({
          id: `${table.name}-${field.name}`,

          source: table.name,
          target: field.relation.table,

          sourceHandle: `${field.name}-source`,
          targetHandle: `${field.relation.field}-target`,
        })
      })
    })

    set({
      nodes,
      edges,
    })
  },

  saveFlow: async () => {
    const flow = {
      flowId: get().flowId,

      erdText: get().erdText,

      nodes: get().nodes,
      edges: get().edges,
    }

    localStorage.setItem(
      `flow-${flow.flowId}`,
      JSON.stringify(flow)
    )

    /*
      later:
      save to db
    */
  },

  loadFlow: async (id) => {
    const raw = localStorage.getItem(
      `flow-${id}`
    )

    if (!raw) return

    const flow = JSON.parse(raw)

    set({
      flowId: flow.flowId,
      erdText: flow.erdText,
      nodes: flow.nodes,
      edges: flow.edges,
    })
  },
}))
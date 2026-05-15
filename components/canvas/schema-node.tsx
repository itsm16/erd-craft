"use client"

import {
  Handle,
  NodeProps,
  Position,
} from "@xyflow/react"

type SchemaField = {
  name: string
  type: string
  constraints?: string[]
}

type SchemaNodeData = {
  tableName: string
  fields: SchemaField[]
}

export const SchemaNode = ({
  id,
  data,
}: any) => {
  return (
    <div className="min-w-[280px] overflow-hidden rounded-xl border bg-background shadow-sm">
      {/* Table Header */}
      <div className="border-b px-4 py-3">
        <h3 className="font-semibold tracking-tight">
          {data.tableName}
        </h3>
      </div>

      {/* Fields */}
      <div className="relative">
        {data.fields.map((field: SchemaField, index: number) => (
          <div
            key={`${field.name}-${index}`}
            className="relative flex items-center justify-between border-b px-4 py-2 text-sm last:border-none"
          >
            {/* Left Handle */}
            <Handle
              type="target"
              position={Position.Left}
              id={`${field.name}-target`}
              className="!left-[-6px] !h-2.5 !w-2.5 border"
            />

            {/* Right Handle */}
            <Handle
              type="source"
              position={Position.Right}
              id={`${field.name}-source`}
              className="!right-[-6px] !h-2.5 !w-2.5 border"
            />

            <div className="flex items-center gap-2">
              <span className="font-medium">
                {field.name}
              </span>

              {field.constraints?.includes("pk") && (
                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] uppercase text-primary">
                  pk
                </span>
              )}

              {field.constraints?.includes("fk") && (
                <span className="rounded bg-orange-500/10 px-1.5 py-0.5 text-[10px] uppercase text-orange-500">
                  fk
                </span>
              )}
            </div>

            <span className="text-muted-foreground">
              {field.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
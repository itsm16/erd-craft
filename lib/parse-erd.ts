type ParsedField = {
  name: string
  type: string
  constraints: string[]
  relation?: {
    table: string
    field: string
  }
}

type ParsedTable = {
  name: string
  fields: ParsedField[]
}

export function parseErd(
  input: string
): ParsedTable[] {
  const tables: ParsedTable[] = []

  const tableRegex =
    /(\w+)\s*\{([^}]*)\}/g

  const matches = [...input.matchAll(tableRegex)]

  for (const match of matches) {
    const tableName = match[1]

    const body = match[2]

    const lines = body
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)

    const fields: ParsedField[] = lines.map(
      (line) => {
        const parts = line.split(/\s+/)

        const name = parts[0]
        const type = parts[1]

        const constraints =
          parts.filter(
            (p) =>
              p === "pk" || p === "fk"
          )

        let relation

        const relationIndex =
          parts.indexOf(">")

        if (relationIndex !== -1) {
          const target =
            parts[relationIndex + 1]

          const [table, field] =
            target.split(".")

          relation = {
            table,
            field,
          }
        }

        return {
          name,
          type,
          constraints,
          relation,
        }
      }
    )

    tables.push({
      name: tableName,
      fields,
    })
  }

  return tables
}
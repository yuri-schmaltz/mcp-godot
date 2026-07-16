/**
 * Zod schemas for MCP tool arguments.
 *
 * These schemas validate the camelCase-normalized form of each tool's
 * arguments. The dispatch in `index.ts` calls `validateToolArgs(name, raw)`
 * before invoking the handler — this catches missing required fields and
 * type mismatches early with a clear error message, instead of letting
 * `args: any` flow into the handler and crash later.
 *
 * All schemas use `.passthrough()` so that extra fields an LLM might
 * include are ignored rather than rejected — keeps the API forward-compatible.
 */
import { z } from 'zod';

const nonEmptyString = z.string().min(1);
const optionalString = z.string().min(1).optional();

export const ToolSchemas: Record<string, z.ZodTypeAny> = {
  launch_editor: z
    .object({
      projectPath: nonEmptyString,
    })
    .passthrough(),

  run_project: z
    .object({
      projectPath: nonEmptyString,
      scene: optionalString,
    })
    .passthrough(),

  // No-argument tools: accept anything (passthrough = lenient).
  get_debug_output: z.object({}).passthrough(),
  stop_project: z.object({}).passthrough(),
  get_godot_version: z.object({}).passthrough(),

  list_projects: z
    .object({
      directory: optionalString,
      recursive: z.boolean().optional(),
    })
    .passthrough(),

  get_project_info: z
    .object({
      projectPath: nonEmptyString,
    })
    .passthrough(),

  create_scene: z
    .object({
      projectPath: nonEmptyString,
      scenePath: nonEmptyString,
      rootNodeType: optionalString,
      newPath: optionalString,
    })
    .passthrough(),

  add_node: z
    .object({
      projectPath: nonEmptyString,
      scenePath: nonEmptyString,
      nodeType: nonEmptyString,
      nodeName: nonEmptyString,
      parentNodePath: optionalString,
      properties: z.record(z.string(), z.any()).optional(),
    })
    .passthrough(),

  load_sprite: z
    .object({
      projectPath: nonEmptyString,
      scenePath: nonEmptyString,
      nodePath: nonEmptyString,
      texturePath: nonEmptyString,
    })
    .passthrough(),

  export_mesh_library: z
    .object({
      projectPath: nonEmptyString,
      scenePath: nonEmptyString,
      outputPath: nonEmptyString,
      meshItemNames: z.array(z.string()).optional(),
    })
    .passthrough(),

  save_scene: z
    .object({
      projectPath: nonEmptyString,
      scenePath: nonEmptyString,
      newPath: optionalString,
      saveAsVariant: z.boolean().optional(),
    })
    .passthrough(),

  get_uid: z
    .object({
      projectPath: nonEmptyString,
      filePath: nonEmptyString,
    })
    .passthrough(),

  update_project_uids: z
    .object({
      projectPath: nonEmptyString,
    })
    .passthrough(),
};

export type ToolName = keyof typeof ToolSchemas;

/**
 * Format Zod issues into a single human-readable string for error responses.
 * Example: "projectPath: Required; scenePath: String must contain at least 1 character(s)"
 */
export function formatZodIssues(issues: z.ZodIssue[]): string {
  return issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : '(root)';
      return `${path}: ${issue.message}`;
    })
    .join('; ');
}

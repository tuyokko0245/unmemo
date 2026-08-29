import { getGenerativeModel, Schema } from 'firebase/ai'
import { ai } from '@/lib/firebase/config'

const EXTRACTION_PROMPT = `あなたはメモアプリのアシスタントです。次のメモ本文から、実行すべきタスク（「〜する」「〜を買う」のような具体的な行動）を抽出してください。

- タスクとして抽出すべきものだけを抜き出す（単なる感想や情報の記録は含めない）
- 抽出したタスクは簡潔な日本語の命令形・体言止めで1行にまとめる
- タスクが1つも見つからない場合は空配列を返す

メモ本文:
"""
{{BODY}}
"""`

const responseSchema = Schema.object({
  properties: {
    todos: Schema.array({ items: Schema.string() }),
  },
})

const MODEL_CANDIDATES = ['gemini-3.5-flash-lite', 'gemini-3.6-flash']

export async function extractTodosFromMemo(body: string): Promise<string[]> {
  const prompt = EXTRACTION_PROMPT.replace('{{BODY}}', body)
  let lastError: unknown

  for (const modelName of MODEL_CANDIDATES) {
    try {
      const model = getGenerativeModel(ai, {
        model: modelName,
        generationConfig: { responseMimeType: 'application/json', responseSchema },
      })
      const result = await model.generateContent(prompt)
      const parsed = JSON.parse(result.response.text()) as { todos?: unknown }
      if (!Array.isArray(parsed.todos)) return []
      return parsed.todos.filter((t): t is string => typeof t === 'string' && t.trim().length > 0).map((t) => t.trim())
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error ? lastError : new Error('TODO抽出に失敗しました')
}

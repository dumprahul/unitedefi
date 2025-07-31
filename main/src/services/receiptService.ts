import { supabase, Receipt } from '@/lib/supabase'

export async function createReceipt(data: {
  emoji_code: string
  description: string
  destination_chain: string
  destination_token: string
  destination_token_address: string
  destination_address: string
  amount: string
}): Promise<Receipt | null> {
  try {
    const { data: receipt, error } = await supabase
      .from('receipts')
      .insert([data])
      .select()
      .single()

    if (error) {
      console.error('Error creating receipt:', error)
      return null
    }

    return receipt
  } catch (error) {
    console.error('Error creating receipt:', error)
    return null
  }
}

export async function getReceiptByEmojiCode(emojiCode: string): Promise<Receipt | null> {
  try {
    const { data: receipt, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('emoji_code', emojiCode)
      .single()

    if (error) {
      console.error('Error fetching receipt:', error)
      return null
    }

    return receipt
  } catch (error) {
    console.error('Error fetching receipt:', error)
    return null
  }
} 
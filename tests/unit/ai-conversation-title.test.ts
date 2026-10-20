import { describe, expect, it } from 'vitest';
import { makeAiConversationTitle } from '@/widgets/ai-chat/model/ai-conversation-title';

describe('AI conversation titles created from the first message', () => {
  it('uses actual Vietnamese user content instead of a generic placeholder', () => {
    expect(makeAiConversationTitle(' Taskmanly   giúp\ncông việc hiệu quả hơn. '))
      .toBe('Taskmanly giúp công việc hiệu quả hơn.');
    expect(makeAiConversationTitle('Tạo 3 task cho sprint mới'))
      .toBe('Tạo 3 task cho sprint mới');
  });

  it('truncates long prompts safely without splitting emoji', () => {
    const title = makeAiConversationTitle('📋'.repeat(90));
    expect(Array.from(title)).toHaveLength(70);
    expect(title.endsWith('…')).toBe(true);
    expect(title).not.toContain('AI Assistant');
  });
});

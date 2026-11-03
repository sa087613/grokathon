# Grok Bot playbook

1. The owner clicks Hand to Grok Bot on a surfaced item. Rejected items can't be handed off.
2. Peachtree drafts a task packet: business, item, why it matters, requested action, deadline, source.
3. The run moves Drafted, Sent to bot, Awaiting approval. It stops there.
4. Only the owner's approval moves it to Done.

`PARTNER_MODE=simulated` fakes steps 2 to 4 locally and sends nothing. `PARTNER_MODE=manual` shows the packet to copy to the bot by hand, and the owner sets the status in the drawer. There is no Grok Bot API integration or webhook in this repo.

Runs are stored in the `partner_runs` table. Code is in `src/partners/grokbot.ts`.

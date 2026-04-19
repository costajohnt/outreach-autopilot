#!/usr/bin/env node
import { Command } from 'commander';
import { runTargetAdd } from './commands/target-add.js';
import { runTargetLog } from './commands/target-log.js';
import { runTargetList } from './commands/target-list.js';
import { runTargetReview } from './commands/target-review.js';
import { runVoiceSamples } from './commands/voice-samples.js';

const program = new Command();
program
  .name('outreach-autopilot')
  .description('AI-assisted LinkedIn outreach tooling')
  .version('0.1.0');

const target = program.command('target').description('Target management');

target
  .command('add')
  .description('Add a new outreach target')
  .requiredOption('--config <path>', 'path to config.json')
  .requiredOption('--name <name>')
  .requiredOption('--company <company>')
  .requiredOption('--role <role>')
  .requiredOption('--linkedin <url>')
  .action(async (opts) => {
    const result = await runTargetAdd(opts);
    console.log(JSON.stringify(result, null, 2));
  });

target
  .command('log')
  .description('Log engagement with a target')
  .requiredOption('--config <path>', 'path to config.json')
  .requiredOption('--slug <slug>', 'target slug')
  .requiredOption('--action <text>', 'what you did')
  .option('--date <YYYY-MM-DD>', 'date (default: today)')
  .action(async (opts) => {
    await runTargetLog(opts);
    console.log(`Logged engagement with ${opts.slug}`);
  });

target
  .command('list')
  .description('List all targets')
  .requiredOption('--config <path>', 'path to config.json')
  .action(async (opts) => {
    const result = await runTargetList(opts);
    console.log(JSON.stringify(result, null, 2));
    if (result.skipped.length > 0) {
      console.error(`Warning: skipped ${result.skipped.length} corrupted file(s)`);
      process.exitCode = 1;
    }
  });

target
  .command('review')
  .description('Weekly review: surface targets needing action')
  .requiredOption('--config <path>', 'path to config.json')
  .option('--today <YYYY-MM-DD>', 'override today (for testing)')
  .action(async (opts) => {
    const result = await runTargetReview(opts);
    console.log(JSON.stringify(result, null, 2));
  });

const voice = program.command('voice').description('Voice sample management');

voice
  .command('samples')
  .description('Load voice samples and report any missing files')
  .requiredOption('--config <path>', 'path to config.json')
  .action(async (opts) => {
    const result = await runVoiceSamples(opts);
    console.log(JSON.stringify(result, null, 2));
  });

program.parseAsync().catch((err) => {
  if (err instanceof Error) {
    console.error('Error:', err.message);
    if (process.env.OUTREACH_AUTOPILOT_DEBUG) {
      console.error(err.stack);
    }
  } else {
    console.error('Error:', String(err));
  }
  process.exit(1);
});

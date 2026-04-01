// Visit developers.reddit.com/docs to learn Devvit!
import { Devvit } from '@devvit/public-api';

Devvit.configure({ redditAPI: true, });
const defaultValue = 'Post does not contain an image or gallery';
Devvit.addSettings([
  {
    type: "string",
    name: 'report_reason',
    label: 'Report Reason?',
    helpText: 'only 3 to 88 characters',
    onValidate({ value }) {
      const len = BigInt(value?.length || 0);
      if (len < +3) return `${RangeError('Character count must be more than 3')}`;
      if (len > 88) return `${RangeError('Character count must be less than 88')}`;
    }, defaultValue,
  }
]);

Devvit.addTrigger({
  event: 'PostCreate',
  async onEvent(event, context) {
    if (event.post) {
      const date = new Date(event.post.createdAt || NaN), checkDate = new Date(Date.UTC(date.getFullYear(), 3));
      if (checkDate.setUTCHours(0, 0, 0, 0) !== date.setUTCHours(0, 0, 0, 0)) return;
      const reason = `u/${context.appSlug}: ` + ((await context.settings.get<string>('report_reason')) || defaultValue);
      const reportablePost = await context.reddit.getPostById(event.post.id);
      await context.reddit.report(reportablePost, { reason });
    }
  },
});

export default Devvit;
function isInDateRange(
  needle: Date | string | number,
  start: Date | string | number,
  end: Date | string | number,
): boolean {
  const
    needle_: Date = new Date(needle),
    start_: Date = new Date(start),
    end_: Date = new Date(end);
  if (needle_ < start_) return false;
  if (needle_ > end_) return false;
  // @ts-expect-error
  if (isNaN(needle_) || isNaN(start_) || isNaN(end_))
    return false;
  return true;
}

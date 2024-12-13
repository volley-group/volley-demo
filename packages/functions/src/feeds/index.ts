import { GCP } from './gcp';
import { GitHub } from './github';
import { SendGrid } from './sendgrid';

export default [new GitHub(), new GCP(), new SendGrid()];

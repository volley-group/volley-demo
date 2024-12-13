import type { IService, RSSFeed, StatusMessage } from '../types';
import { ProductFeed } from '../product';
import Parser from 'rss-parser';

export class DatadogUS1 extends ProductFeed<StatusMessage> {
  name = 'datadog-us1';
  displayName = 'Datadog US1';
  logo = 'https://imgix.datadoghq.com/img/about/presskit/logo-v/dd_vertical_purple.png?auto=format&fit=max&w=847&dpr=2';

  feedUrl = 'https://status.datadoghq.com/history.rss';

  async getServices(): Promise<IService[]> {
    return [
      { displayName: 'Agent Repository', name: 'agent_repository' },
      { displayName: 'APM (Application Performance Monitoring)', name: 'apm' },
      { displayName: 'Application Security Management', name: 'application_security_management' },
      { displayName: 'Application Vulnerability Management', name: 'application_vulnerability_management' },
      { displayName: 'Audit Trail', name: 'audit_trail' },
      { displayName: 'CI Visibility', name: 'ci_visibility' },
      { displayName: 'Cloud Cost Management', name: 'cloud_cost_management' },
      { displayName: 'Cloud Security Management', name: 'cloud_security_management' },
      { displayName: 'Cloud SIEM (Security Information and Event Management)', name: 'cloud_siem' },
      { displayName: 'Cloud Workload Security', name: 'cloud_workload_security' },
      { displayName: 'Code Security', name: 'code_security' },
      { displayName: 'Database Monitoring', name: 'database_monitoring' },
      { displayName: 'Data Jobs Monitoring', name: 'data_jobs_monitoring' },
      { displayName: 'Data Streams Monitoring', name: 'data_streams_monitoring' },
      { displayName: 'Incident Management', name: 'incident_management' },
      { displayName: 'Log Management', name: 'log_management' },
      { displayName: 'Metrics and Infrastructure Monitoring', name: 'metrics_infrastructure_monitoring' },
      { displayName: 'Mobile Application', name: 'mobile_application' },
      { displayName: 'Monitors', name: 'monitors' },
      { displayName: 'NDM (Network Device Monitoring)', name: 'ndm' },
      { displayName: 'NPM (Network Performance Monitoring)', name: 'npm' },
      { displayName: 'Observability Pipelines', name: 'observability_pipelines' },
      { displayName: 'Profiling', name: 'profiling' },
      { displayName: 'RUM (Real User Monitoring)', name: 'rum' },
      { displayName: 'Sensitive Data Scanner', name: 'sensitive_data_scanner' },
      { displayName: 'Serverless', name: 'serverless' },
      { displayName: 'Synthetics', name: 'synthetics' },
      { displayName: 'Universal Service Monitoring', name: 'universal_service_monitoring' },
      { displayName: 'Web Application', name: 'web_application' },
      { displayName: 'Workflow Automation', name: 'workflow_automation' },
      { displayName: 'www.datadoghq.com', name: 'www' },
    ];
  }

  async getFeed(): Promise<StatusMessage[]> {
    const parser = new Parser<RSSFeed, StatusMessage>();
    const feed = await parser.parseURL(this.feedUrl);
    return feed.items.map((item) => ({
      guid: item.guid,
      title: item.title,
      content: item.content,
      pubDate: new Date(item.pubDate).toISOString(),
    }));
  }
}

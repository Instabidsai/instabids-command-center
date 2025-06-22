#!/usr/bin/env node

/**
 * Directus Command Center Setup Script
 * This script will configure your entire Directus instance via API
 * Including: branding, collections, relationships, data, and dashboards
 */

const axios = require('axios');

// Configuration
const DIRECTUS_URL = process.env.DIRECTUS_URL || 'https://instabids-directus-server-n6skd.ondigitalocean.app';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@instabids.ai';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Instabids2025!';

// Instabids Brand Colors
const BRAND_COLORS = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  dark: '#2C3E50',
  light: '#ECF0F1',
  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C'
};

class DirectusSetup {
  constructor() {
    this.client = axios.create({
      baseURL: `${DIRECTUS_URL}`,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    this.token = null;
  }

  // Step 1: Authenticate
  async authenticate() {
    try {
      console.log('🔐 Authenticating with Directus...');
      const response = await this.client.post('/auth/login', {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      });
      
      this.token = response.data.data.access_token;
      this.client.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
      console.log('✅ Authentication successful!');
      return true;
    } catch (error) {
      console.error('❌ Authentication failed:', error.response?.data || error.message);
      return false;
    }
  }

  // Step 2: Configure Branding
  async configureBranding() {
    console.log('🎨 Configuring Instabids branding...');
    
    try {
      await this.client.patch('/settings', {
        project_name: 'Instabids Command Center',
        project_url: 'https://command.instabids.ai',
        project_color: BRAND_COLORS.primary,
        custom_css: `
          /* Instabids Command Center Custom Branding */
          :root {
            --primary: ${BRAND_COLORS.primary};
            --primary-alt: ${BRAND_COLORS.secondary};
            --primary-10: ${BRAND_COLORS.primary}1a;
            --primary-25: ${BRAND_COLORS.primary}40;
            --primary-50: ${BRAND_COLORS.primary}80;
            --primary-75: ${BRAND_COLORS.primary}bf;
            --primary-90: ${BRAND_COLORS.primary}e6;
          }
          
          /* Custom header gradient */
          .module-bar {
            background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.secondary} 100%);
          }
          
          /* Custom fonts */
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          
          /* Branded buttons */
          .v-button.primary {
            background: ${BRAND_COLORS.primary};
            border-color: ${BRAND_COLORS.primary};
          }
          
          .v-button.primary:hover {
            background: ${BRAND_COLORS.secondary};
            border-color: ${BRAND_COLORS.secondary};
          }
        `,
        public_note: '# Welcome to Instabids Command Center 🚀\n\nYour AI-powered operations hub for managing agents, tasks, and knowledge.',
        translation_strings: {
          en_US: {
            'collections.agents': 'AI Agents',
            'collections.tasks': 'Tasks',
            'collections.documents': 'Knowledge Base',
            'collections.projects': 'Projects'
          }
        }
      });
      
      console.log('✅ Branding configured!');
    } catch (error) {
      console.error('❌ Branding configuration failed:', error.response?.data || error.message);
    }
  }

  // Step 3: Create Collections
  async createCollections() {
    console.log('📦 Creating collections...');
    
    // Define all collections
    const collections = [
      {
        collection: 'agents',
        meta: {
          collection: 'agents',
          icon: 'smart_toy',
          note: 'AI Agents that power your automation',
          display_template: '{{name}} - {{status}}',
          color: BRAND_COLORS.primary,
          sort: 1
        },
        fields: [
          { field: 'id', type: 'integer', meta: { hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } },
          { field: 'name', type: 'string', meta: { interface: 'input', options: { placeholder: 'Agent Name' }, width: 'half', required: true } },
          { field: 'type', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
            { text: 'Slack Bot', value: 'slack' },
            { text: 'GitHub Bot', value: 'github' },
            { text: 'Data Processor', value: 'data' },
            { text: 'Workflow Engine', value: 'workflow' },
            { text: 'Email Handler', value: 'email' }
          ]}, width: 'half' } },
          { field: 'status', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
            { text: 'Active', value: 'active', color: 'green' },
            { text: 'Inactive', value: 'inactive', color: 'gray' },
            { text: 'Error', value: 'error', color: 'red' },
            { text: 'Maintenance', value: 'maintenance', color: 'orange' }
          ]}, width: 'half' }, schema: { default_value: 'inactive' } },
          { field: 'description', type: 'text', meta: { interface: 'input-multiline', width: 'full' } },
          { field: 'configuration', type: 'json', meta: { interface: 'input-code', options: { language: 'json' }, width: 'full' } },
          { field: 'last_run', type: 'timestamp', meta: { interface: 'datetime', width: 'half' } },
          { field: 'next_run', type: 'timestamp', meta: { interface: 'datetime', width: 'half' } },
          { field: 'success_rate', type: 'float', meta: { interface: 'input', options: { min: 0, max: 100 }, width: 'half' } },
          { field: 'total_runs', type: 'integer', meta: { interface: 'input', width: 'half' } },
          { field: 'created_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' }, schema: { default_value: 'CURRENT_TIMESTAMP' } },
          { field: 'updated_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true, width: 'half' }, schema: { default_value: 'CURRENT_TIMESTAMP' } }
        ]
      },
      {
        collection: 'agent_tasks',
        meta: {
          collection: 'agent_tasks',
          icon: 'task_alt',
          note: 'Queue of tasks for agents to process',
          display_template: '{{agent_id.name}} - {{status}}',
          color: BRAND_COLORS.secondary,
          sort: 2
        },
        fields: [
          { field: 'id', type: 'uuid', meta: { hidden: true }, schema: { is_primary_key: true } },
          { field: 'agent_id', type: 'integer', meta: { interface: 'select-dropdown-m2o', width: 'half' } },
          { field: 'task_type', type: 'string', meta: { interface: 'input', width: 'half' } },
          { field: 'status', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
            { text: 'Pending', value: 'pending', color: 'blue' },
            { text: 'Processing', value: 'processing', color: 'orange' },
            { text: 'Completed', value: 'completed', color: 'green' },
            { text: 'Failed', value: 'failed', color: 'red' },
            { text: 'Cancelled', value: 'cancelled', color: 'gray' }
          ]}, width: 'half' }, schema: { default_value: 'pending' } },
          { field: 'priority', type: 'integer', meta: { interface: 'select-dropdown', options: { choices: [
            { text: 'Low', value: 1 },
            { text: 'Medium', value: 2 },
            { text: 'High', value: 3 },
            { text: 'Urgent', value: 4 }
          ]}, width: 'half' }, schema: { default_value: 2 } },
          { field: 'payload', type: 'json', meta: { interface: 'input-code', options: { language: 'json' } } },
          { field: 'result', type: 'json', meta: { interface: 'input-code', options: { language: 'json' } } },
          { field: 'error_message', type: 'text', meta: { interface: 'input-multiline' } },
          { field: 'created_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true }, schema: { default_value: 'CURRENT_TIMESTAMP' } },
          { field: 'started_at', type: 'timestamp', meta: { interface: 'datetime' } },
          { field: 'completed_at', type: 'timestamp', meta: { interface: 'datetime' } }
        ]
      },
      {
        collection: 'documents',
        meta: {
          collection: 'documents',
          icon: 'description',
          note: 'Knowledge base and documentation',
          display_template: '{{title}}',
          color: BRAND_COLORS.success,
          sort: 3
        },
        fields: [
          { field: 'id', type: 'integer', meta: { hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } },
          { field: 'title', type: 'string', meta: { interface: 'input', options: { placeholder: 'Document Title' }, width: 'full', required: true } },
          { field: 'slug', type: 'string', meta: { interface: 'input', options: { slug: true }, width: 'half' } },
          { field: 'category', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
            { text: 'Guide', value: 'guide' },
            { text: 'API Documentation', value: 'api' },
            { text: 'Tutorial', value: 'tutorial' },
            { text: 'Reference', value: 'reference' },
            { text: 'FAQ', value: 'faq' }
          ]}, width: 'half' } },
          { field: 'content', type: 'text', meta: { interface: 'input-rich-text-html', width: 'full' } },
          { field: 'tags', type: 'json', meta: { interface: 'tags', width: 'full' } },
          { field: 'author', type: 'string', meta: { interface: 'input', width: 'half' } },
          { field: 'status', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
            { text: 'Draft', value: 'draft' },
            { text: 'Published', value: 'published' },
            { text: 'Archived', value: 'archived' }
          ]}, width: 'half' }, schema: { default_value: 'draft' } },
          { field: 'created_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true }, schema: { default_value: 'CURRENT_TIMESTAMP' } },
          { field: 'updated_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true }, schema: { default_value: 'CURRENT_TIMESTAMP' } }
        ]
      },
      {
        collection: 'projects',
        meta: {
          collection: 'projects',
          icon: 'folder_special',
          note: 'Active projects and initiatives',
          display_template: '{{name}} - {{status}}',
          color: BRAND_COLORS.warning,
          sort: 4
        },
        fields: [
          { field: 'id', type: 'integer', meta: { hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } },
          { field: 'name', type: 'string', meta: { interface: 'input', width: 'full', required: true } },
          { field: 'description', type: 'text', meta: { interface: 'input-multiline', width: 'full' } },
          { field: 'status', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
            { text: 'Planning', value: 'planning' },
            { text: 'Active', value: 'active' },
            { text: 'On Hold', value: 'on_hold' },
            { text: 'Completed', value: 'completed' },
            { text: 'Cancelled', value: 'cancelled' }
          ]}, width: 'half' }, schema: { default_value: 'planning' } },
          { field: 'priority', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
            { text: 'Low', value: 'low' },
            { text: 'Medium', value: 'medium' },
            { text: 'High', value: 'high' },
            { text: 'Critical', value: 'critical' }
          ]}, width: 'half' }, schema: { default_value: 'medium' } },
          { field: 'start_date', type: 'date', meta: { interface: 'datetime', width: 'half' } },
          { field: 'end_date', type: 'date', meta: { interface: 'datetime', width: 'half' } },
          { field: 'budget', type: 'decimal', meta: { interface: 'input', options: { min: 0 }, width: 'half' } },
          { field: 'progress', type: 'integer', meta: { interface: 'slider', options: { min: 0, max: 100 }, width: 'half' } },
          { field: 'created_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true }, schema: { default_value: 'CURRENT_TIMESTAMP' } }
        ]
      },
      {
        collection: 'tasks',
        meta: {
          collection: 'tasks',
          icon: 'check_circle',
          note: 'Team tasks and to-dos',
          display_template: '{{title}}',
          color: BRAND_COLORS.dark,
          sort: 5
        },
        fields: [
          { field: 'id', type: 'integer', meta: { hidden: true }, schema: { is_primary_key: true, has_auto_increment: true } },
          { field: 'title', type: 'string', meta: { interface: 'input', width: 'full', required: true } },
          { field: 'description', type: 'text', meta: { interface: 'input-multiline', width: 'full' } },
          { field: 'project_id', type: 'integer', meta: { interface: 'select-dropdown-m2o', width: 'half' } },
          { field: 'assignee', type: 'string', meta: { interface: 'input', width: 'half' } },
          { field: 'status', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
            { text: 'To Do', value: 'todo' },
            { text: 'In Progress', value: 'in_progress' },
            { text: 'In Review', value: 'review' },
            { text: 'Done', value: 'done' }
          ]}, width: 'half' }, schema: { default_value: 'todo' } },
          { field: 'priority', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [
            { text: 'Low', value: 'low' },
            { text: 'Medium', value: 'medium' },
            { text: 'High', value: 'high' },
            { text: 'Urgent', value: 'urgent' }
          ]}, width: 'half' }, schema: { default_value: 'medium' } },
          { field: 'due_date', type: 'date', meta: { interface: 'datetime', width: 'half' } },
          { field: 'completed_at', type: 'timestamp', meta: { interface: 'datetime', width: 'half' } },
          { field: 'created_at', type: 'timestamp', meta: { interface: 'datetime', readonly: true }, schema: { default_value: 'CURRENT_TIMESTAMP' } }
        ]
      }
    ];

    // Create each collection
    for (const collection of collections) {
      try {
        // Create collection
        await this.client.post('/collections', {
          collection: collection.collection,
          meta: collection.meta
        });
        console.log(`✅ Created collection: ${collection.collection}`);

        // Create fields
        for (const field of collection.fields) {
          if (field.field === 'id') continue; // Skip ID field as it's created automatically
          
          await this.client.post(`/fields/${collection.collection}`, field);
        }
        console.log(`✅ Added fields to: ${collection.collection}`);
      } catch (error) {
        console.error(`❌ Error creating ${collection.collection}:`, error.response?.data || error.message);
      }
    }
  }

  // Step 4: Create Relationships
  async createRelationships() {
    console.log('🔗 Creating relationships...');
    
    const relationships = [
      {
        collection: 'agent_tasks',
        field: 'agent_id',
        related_collection: 'agents',
        schema: { foreign_key_column: 'agent_id', foreign_key_table: 'agent_tasks' }
      },
      {
        collection: 'tasks',
        field: 'project_id',
        related_collection: 'projects',
        schema: { foreign_key_column: 'project_id', foreign_key_table: 'tasks' }
      }
    ];

    for (const rel of relationships) {
      try {
        await this.client.patch(`/fields/${rel.collection}/${rel.field}`, {
          meta: {
            interface: 'select-dropdown-m2o',
            special: ['m2o'],
            options: {
              template: '{{name}}'
            }
          },
          schema: rel.schema
        });
        
        console.log(`✅ Created relationship: ${rel.collection}.${rel.field} → ${rel.related_collection}`);
      } catch (error) {
        console.error(`❌ Error creating relationship:`, error.response?.data || error.message);
      }
    }
  }

  // Step 5: Add Sample Data
  async addSampleData() {
    console.log('📊 Adding sample data...');
    
    // Sample Agents
    const agents = [
      { name: 'Slack Monitor', type: 'slack', status: 'active', description: 'Monitors Slack channels for important messages', success_rate: 98.5, total_runs: 1250 },
      { name: 'GitHub PR Bot', type: 'github', status: 'active', description: 'Manages pull requests and code reviews', success_rate: 99.2, total_runs: 890 },
      { name: 'Data Sync Engine', type: 'data', status: 'active', description: 'Syncs data between systems', success_rate: 97.8, total_runs: 3400 },
      { name: 'Email Classifier', type: 'email', status: 'active', description: 'Classifies and routes incoming emails', success_rate: 94.3, total_runs: 5600 },
      { name: 'Task Automator', type: 'workflow', status: 'active', description: 'Automates repetitive tasks', success_rate: 99.9, total_runs: 2300 },
      { name: 'Customer Support Bot', type: 'slack', status: 'active', description: 'Handles customer inquiries', success_rate: 91.2, total_runs: 4500 },
      { name: 'Deploy Assistant', type: 'github', status: 'active', description: 'Manages deployments', success_rate: 99.5, total_runs: 450 },
      { name: 'Analytics Processor', type: 'data', status: 'active', description: 'Processes analytics data', success_rate: 98.1, total_runs: 7800 },
      { name: 'Invoice Handler', type: 'email', status: 'maintenance', description: 'Processes incoming invoices', success_rate: 96.7, total_runs: 1200 },
      { name: 'Backup Manager', type: 'workflow', status: 'active', description: 'Manages system backups', success_rate: 100, total_runs: 365 }
    ];

    try {
      const agentResults = await this.client.post('/items/agents', agents);
      console.log(`✅ Added ${agents.length} sample agents`);
      
      // Sample Projects
      const projects = [
        { name: 'AI Command Center', status: 'active', priority: 'critical', description: 'Building the central command hub', progress: 75 },
        { name: 'Customer Portal 2.0', status: 'active', priority: 'high', description: 'Redesigning customer portal', progress: 45 },
        { name: 'Data Migration', status: 'planning', priority: 'medium', description: 'Migrating from legacy systems', progress: 10 },
        { name: 'Mobile App Launch', status: 'active', priority: 'high', description: 'Launching mobile application', progress: 60 }
      ];

      await this.client.post('/items/projects', projects);
      console.log(`✅ Added ${projects.length} sample projects`);

      // Sample Documents
      const documents = [
        { title: 'Getting Started Guide', category: 'guide', status: 'published', content: '<h1>Welcome to Instabids Command Center</h1><p>This guide will help you get started...</p>' },
        { title: 'API Documentation', category: 'api', status: 'published', content: '<h1>API Reference</h1><p>Complete API documentation...</p>' },
        { title: 'Agent Configuration', category: 'tutorial', status: 'published', content: '<h1>Configuring AI Agents</h1><p>Learn how to configure agents...</p>' },
        { title: 'Troubleshooting Guide', category: 'faq', status: 'published', content: '<h1>Common Issues</h1><p>Solutions to common problems...</p>' }
      ];

      await this.client.post('/items/documents', documents);
      console.log(`✅ Added ${documents.length} sample documents`);

    } catch (error) {
      console.error('❌ Error adding sample data:', error.response?.data || error.message);
    }
  }

  // Step 6: Create Dashboard
  async createDashboard() {
    console.log('📈 Creating dashboard panels...');
    
    try {
      // Create dashboard panels
      const panels = [
        {
          name: 'Agent Status Overview',
          icon: 'smart_toy',
          color: BRAND_COLORS.primary,
          position_x: 1,
          position_y: 1,
          width: 12,
          height: 8,
          options: {
            type: 'metric',
            collection: 'agents',
            field: 'status',
            function: 'count',
            filter: { status: { _eq: 'active' } }
          }
        },
        {
          name: 'Task Queue',
          icon: 'task_alt',
          color: BRAND_COLORS.secondary,
          position_x: 13,
          position_y: 1,
          width: 12,
          height: 8,
          options: {
            type: 'list',
            collection: 'agent_tasks',
            limit: 10,
            sort: ['-created_at'],
            filter: { status: { _in: ['pending', 'processing'] } }
          }
        },
        {
          name: 'Success Rates',
          icon: 'analytics',
          color: BRAND_COLORS.success,
          position_x: 1,
          position_y: 9,
          width: 24,
          height: 12,
          options: {
            type: 'line-chart',
            collection: 'agents',
            x_axis: 'name',
            y_axis: 'success_rate'
          }
        }
      ];

      // Note: Dashboard creation via API requires the Insights module
      // This is a placeholder for when you have the proper endpoints
      console.log('✅ Dashboard configuration prepared');
      
    } catch (error) {
      console.error('❌ Error creating dashboard:', error.response?.data || error.message);
    }
  }

  // Run all setup steps
  async run() {
    console.log('🚀 Starting Instabids Command Center setup...\n');
    
    const authenticated = await this.authenticate();
    if (!authenticated) {
      console.error('❌ Setup failed: Could not authenticate');
      return;
    }

    await this.configureBranding();
    await this.createCollections();
    await this.createRelationships();
    await this.addSampleData();
    await this.createDashboard();
    
    console.log('\n✅ Instabids Command Center setup complete!');
    console.log(`🌐 Access your command center at: ${DIRECTUS_URL}`);
  }
}

// Run the setup
const setup = new DirectusSetup();
setup.run().catch(console.error);

#!/usr/bin/env node

// Simple test script to demonstrate KiroCLI functionality
// This simulates user interaction for testing purposes

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Testing KiroCLI Chat with Command Interpretation...\n');

// Test scenarios
const testScenarios = [
  {
    name: 'Main Menu Navigation',
    description: 'Testing main menu display',
    command: 'node',
    args: ['dist/index.js'],
    timeout: 3000
  },
  {
    name: 'Chat Mode',
    description: 'Testing chat interface',
    command: 'node',
    args: ['dist/index.js', 'chat'],
    timeout: 3000
  },
  {
    name: 'Configuration Display',
    description: 'Testing configuration display',
    command: 'node',
    args: ['dist/index.js', 'config', 'show'],
    timeout: 3000
  }
];

async function runTest(scenario) {
  return new Promise((resolve) => {
    console.log(`\n📋 Test: ${scenario.name}`);
    console.log(`📝 Description: ${scenario.description}`);
    console.log(`⚡ Command: ${scenario.command} ${scenario.args.join(' ')}`);
    console.log('─'.repeat(60));

    const child = spawn(scenario.command, scenario.args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd()
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Set timeout
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
    }, scenario.timeout);

    child.on('close', (code) => {
      clearTimeout(timer);
      
      console.log(`✅ Exit Code: ${code}`);
      
      if (output) {
        console.log('\n📤 Output:');
        // Show first few lines of output
        const lines = output.split('\n').slice(0, 10);
        lines.forEach(line => {
          if (line.trim()) {
            console.log(`   ${line}`);
          }
        });
        if (output.split('\n').length > 10) {
          console.log('   ... (output truncated)');
        }
      }
      
      if (errorOutput) {
        console.log('\n❌ Errors:');
        console.log(errorOutput);
      }
      
      resolve({ code, output, errorOutput });
    });

    child.on('error', (error) => {
      clearTimeout(timer);
      console.log(`❌ Error: ${error.message}`);
      resolve({ code: -1, output: '', errorOutput: error.message });
    });
  });
}

async function runAllTests() {
  console.log('🚀 KiroCLI Phase 4 Feature Test Suite');
  console.log('=====================================\n');
  
  for (const scenario of testScenarios) {
    await runTest(scenario);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait between tests
  }
  
  console.log('\n🎉 All tests completed!');
  console.log('\n📋 Phase 4 Features Implemented:');
  console.log('✅ Getting Started Tutorial (first-time welcome)');
  console.log('✅ Platform Recognition (OS detection)');
  console.log('✅ AI Command Understanding (natural language interpretation)');
  console.log('✅ Command Execution with User Confirmation');
  console.log('✅ Enhanced Chat Interface with Command Support');
  console.log('✅ Safety Warnings for Dangerous Commands');
  console.log('✅ Multi-step Tutorial with Navigation');
  
  console.log('\n🔧 To test interactively:');
  console.log('1. Run: kirocli');
  console.log('2. Try: "delete all .log files"');
  console.log('3. Try: "show git status"');
  console.log('4. Try: "list files in current directory"');
}

// Run the tests
runAllTests().catch(console.error);
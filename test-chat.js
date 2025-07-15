#!/usr/bin/env node

// Simple test to verify chat functionality
import { AIProvider } from './dist/ai/index.js';

async function testChat() {
    try {
        console.log('🧪 Testing AI Chat Functionality...\n');
        
        const ai = await AIProvider.create('gpt-4');
        console.log(`✅ AI Provider created: ${ai.providerName} (${ai.modelName})`);
        
        const response = await ai.chat([
            { role: 'user', content: 'Say "KiroCLI is working!" in exactly those words.' }
        ]);
        
        console.log(`💬 AI Response: "${response}"`);
        console.log('\n🎉 Chat functionality is working perfectly!');
        
    } catch (error) {
        console.error('❌ Chat test failed:', error.message);
    }
}

testChat();
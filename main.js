const { Actor } = require('apify');
const axios = require('axios');

Actor.main(async () => {
    console.log('🚀 Unlimited Leads  Scraper Starting...');
    console.log('📊 Powered by +100 million leads database');
    
    // Get input
    const input = await Actor.getInput();
    
    if (!input) {
        throw new Error('Input is required!');
    }
    
    const {
        country,
        companySize,
        industry,
        city,
        jobTitle,
        companyName,
        keyword,
        maxLeads = 1000
    } = input;
    
    console.log('🎯 Search Criteria:');
    if (country) console.log(`📍 Country: ${country}`);
    if (companySize) console.log(`🏢 Company Size: ${companySize}`);
    if (industry) console.log(`🏭 Industry: ${industry}`);
    if (city) console.log(`🌆 City: ${city}`);
    if (jobTitle) console.log(`💼 Job Title: ${jobTitle}`);
    if (companyName) console.log(`🏛️ Company: ${companyName}`);
    if (keyword) console.log(`🔍 Keyword: ${keyword}`);
    console.log(`📈 Leads requested: ${maxLeads.toLocaleString()}`);
    
    // Unlimited Leads backend webhook
    const WEBHOOK_URL = 'https://eliasse-n8n.onrender.com/webhook/8594c3d8-bad6-4c24-8458-6800bfd8da89';
    
    try {
        console.log('🔍 Sending search criteria to Unlimited Leads backend...');
        console.log('⏳ Professional lead scraping in progress - please wait...');
        console.log('💼 Searching  database with your criteria...');
        
        // Prepare payload for backend
        const payload = {
            searchCriteria: {
                country,
                companySize,
                industry,
                city,
                jobTitle,
                companyName,
                keyword
            },
            maxLeads: maxLeads,
            timestamp: new Date().toISOString(),
            source: 'unlimited-leads-scraper',
            version: '1.0.0'
        };
        
        // Send request with retry logic (similar to email finder)
        let response;
        let success = false;
        let attempts = 0;
        const maxAttempts = 3;
        
        const userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Unlimited-Leads-Scraper/1.0',
            'Apify-Actor/3.0'
        ];
        
        while (!success && attempts < maxAttempts) {
            attempts++;
            const userAgent = userAgents[(attempts - 1) % userAgents.length];
            
            try {
                console.log(`🔄 Attempt ${attempts}/${maxAttempts} - Processing with Unlimited Leads engine...`);
                
                response = await axios.post(WEBHOOK_URL, payload, {
                    headers: {
                        'Content-Type': 'application/json',
                        'User-Agent': userAgent,
                        'Accept': 'application/json',
                        'X-Source': 'unlimited-leads-',
                        'Cache-Control': 'no-cache'
                    },
                    timeout: 300000, // 5 minutes timeout for large scraping jobs
                    validateStatus: function (status) {
                        return status < 500; // Don't throw on 4xx errors
                    }
                });
                
                if (response.status === 200) {
                    console.log(`✅ Successfully connected to Unlimited Leads backend`);
                    success = true;
                } else {
                    console.log(`⚠️ Backend responded with status ${response.status}, retrying...`);
                    if (attempts < maxAttempts) {
                        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
                    }
                }
                
            } catch (error) {
                console.log(`⚠️ Attempt ${attempts} failed: ${error.message}`);
                if (attempts >= maxAttempts) {
                    throw new Error(`Failed to connect to Unlimited Leads backend after ${maxAttempts} attempts: ${error.message}`);
                }
                await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
            }
        }
        
        if (!success) {
            throw new Error(`Backend connection failed. Status: ${response?.status || 'No response'}`);
        }
        
        const result = response.data;
        console.log('📥 Received response from Unlimited Leads backend');
        
        // Process the leads data
        let leads = [];
        let totalLeads = 0;
        
        // Handle different response formats
        if (result.leads && Array.isArray(result.leads)) {
            leads = result.leads;
        } else if (result.data && Array.isArray(result.data)) {
            leads = result.data;
        } else if (Array.isArray(result)) {
            leads = result;
        } else if (result.success && result.results) {
            leads = Array.isArray(result.results) ? result.results : [result.results];
        } else {
            console.log('⚠️ Unexpected response format, saving entire response');
            leads = [result];
        }
        
        totalLeads = leads.length;
        
        if (totalLeads > 0) {
            // Enrich leads with Unlimited Leads metadata
            const enrichedLeads = leads.map((lead, index) => ({
                ...lead,
                // Ensure consistent field naming
                name: lead.name || lead.full_name || `${lead.firstName || ''} ${lead.lastName || ''}`.trim(),
                email: lead.email || lead.email_address || null,
                phone: lead.phone || lead.phone_number || null,
                company: lead.company || lead.organization || lead.companyName || null,
                title: lead.title || lead.job_title || lead.position || null,
                linkedinUrl: lead.linkedinUrl || lead.linkedin_url || lead.linkedin || null,
                location: lead.location || lead.city || null,
                
                // Unlimited Leads metadata
                scrapedAt: new Date().toISOString(),
                source: 'unlimited-leads-',
                leadId: `_${Date.now()}_${index}`,
                searchCriteria: {
                    country,
                    companySize,
                    industry,
                    city,
                    jobTitle,
                    companyName,
                    keyword
                },
                dataQuality: 'professional',
                verified: lead.verified || false
            }));
            
            // Save to dataset
            await Actor.pushData(enrichedLeads);
            
            console.log('📊 SCRAPING RESULTS:');
            console.log(`✨ Total leads extracted: ${totalLeads.toLocaleString()}`);
            console.log(`💰 Estimated cost: $${(totalLeads * 0.001).toFixed(3)} (at $1/1k leads)`);
        
            console.log('🎁 FREE GIFT : Get Unlimited leads here : → https://unlimited-leads.online/');

            
            
            // Log sample data (first 3 leads)
            console.log('\n📋 Sample leads preview:');
            enrichedLeads.slice(0, 3).forEach((lead, index) => {
                const name = lead.name || 'N/A';
                const email = lead.email || 'No email';
                const company = lead.company || 'No company';
                console.log(`${index + 1}. ${name} - ${email} - ${company}`);
            });
            
            if (totalLeads > 3) {
                console.log(`... and ${(totalLeads - 3).toLocaleString()} more leads`);
            }
            
            // Check data quality
            const emailsFound = enrichedLeads.filter(lead => lead.email).length;
            const phonesFound = enrichedLeads.filter(lead => lead.phone).length;
            const emailRate = ((emailsFound / totalLeads) * 100).toFixed(1);
            const phoneRate = ((phonesFound / totalLeads) * 100).toFixed(1);
            
            console.log('\n📈 Data Quality Metrics:');
            console.log(`📧 Emails found: ${emailsFound}/${totalLeads} (${emailRate}%)`);
            console.log(`📱 Phones found: ${phonesFound}/${totalLeads} (${phoneRate}%)`);
            
        } else {
            console.log('⚠️ No leads found in the response');
            
            // Still save an entry for billing purposes
            await Actor.pushData([{
                error: 'No leads found',
                searchCriteria: {
                    country,
                    companySize,
                    industry,
                    city,
                    jobTitle,
                    companyName,
                    keyword
                },
                timestamp: new Date().toISOString(),
                source: 'unlimited-leads-'
            }]);
        }
        
        // Generate final summary
        const summary = {
            success: true,
            totalLeads: totalLeads,
            searchCriteria: {
                country,
                companySize,
                industry,
                city,
                jobTitle,
                companyName,
                keyword
            },
            maxLeadsRequested: maxLeads,
            estimatedCost: `${(totalLeads * 0.001).toFixed(3)}`,
            dataSource: 'Unlimited Leads (+100M database)',
            processedAt: new Date().toISOString(),
            version: '1.0.0'
        };
        
        console.log('\n🎉 SCRAPING COMPLETED SUCCESSFULLY!');
        
        console.log('🔍 Need to enrich your leads? Use our FREE Hunter.io alternative → https://unlimited-leads.online/bulk-email-finder');
        
        console.log('🎁 FREE GIFT : Get 1,000 FREE leads from Unlimited Leads Database (100M+ contacts) → https://unlimited-leads.online/en');

        
        // Save summary for insights
        await Actor.setValue('_SCRAPER_SUMMARY', summary);
        
        // Set actor output
        await Actor.setValue('OUTPUT', summary);
        
    } catch (error) {
        console.error('❌ Scraping error:', error.message);
        
        // Log detailed error for debugging
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
        
        // Save error for billing and debugging
        const errorSummary = {
            success: false,
            error: error.message,
            searchCriteria: {
                country,
                companySize,
                industry,
                city,
                jobTitle,
                companyName,
                keyword
            },
            timestamp: new Date().toISOString(),
            source: 'unlimited-leads-'
        };
        
        await Actor.pushData([errorSummary]);
        await Actor.setValue('OUTPUT', errorSummary);
        
        // Don't throw - let actor complete with error data
        console.log('💾 Error logged for analysis');
    }
    
    console.log('🏁 Unlimited Leads  Scraper Finished');
    console.log('📞 Support: support@unlimited-leads.online');
});

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

app.post('/generate-report', async (req, res) => {
    const { companyName, companyDescription, dcf, cca, ptm, abv } = req.body;

    if (!companyName || !companyDescription || !dcf || !cca || !ptm || !abv) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Get current date
        const formattedDate = new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Create the exact report format as specified
        const reportTemplate = {
            page1: `
# Valuation Report

Produced By: Jaikaran S
Date: ${formattedDate}

## About Jaikaran S

Jaikaran S is an engineering student with a unique blend of technical acumen and entrepreneurial drive. Proficient in full-stack development, he's not just building software, he's building solutions. His entrepreneurial mindset fuels his passion for creating and launching innovative ventures. Jaikaran's diverse interests, including dance, music, and swimming, reflect his belief in a well-rounded and dynamic approach to life. He's constantly seeking opportunities to learn, grow, and make a meaningful impact.

## About ${companyName}

${companyDescription}

## Service Provided

Jaikaran S has been engaged to provide a comprehensive valuation service for ${companyName}. This report outlines the valuation methodologies employed, the results derived, and the conclusions drawn to determine the fair value of ${companyName}.
`,
            page2: `
# Valuation Methodologies

## Method 1: Discounted Cash Flow (DCF)

- **Description:**
The Discounted Cash Flow (DCF) method estimates the value of ${companyName} based on its projected future cash flows, discounted to their present value using an appropriate discount rate. This approach reflects the company's ability to generate cash flows over time and accounts for the time value of money.
- **Valuation:** ${dcf}
👉 Jaikaran S values ${companyName} at ${dcf} using the DCF method.

## Method 2: Comparable Company Analysis (CCA)

- **Description:**
The Comparable Company Analysis (CCA) method values ${companyName} by comparing it to similar companies in the industry. Key financial metrics and valuation multiples are analyzed to derive a fair market value.
- **Valuation:** ${cca}
👉 Jaikaran S values ${companyName} at ${cca} using the CCA method.

## Method 3: Precedent Transaction Method (PTM)

- **Description:**
The Precedent Transaction Method (PTM) evaluates ${companyName} based on the purchase prices of similar companies in recent transactions. This method provides insight into the premiums paid for comparable businesses in the market.
- **Valuation:** ${ptm}
👉 Jaikaran S values ${companyName} at ${ptm} using the PTM method.

## Method 4: Asset-Based Valuation (ABV)

- **Description:**
The Asset-Based Valuation (ABV) method calculates the value of ${companyName} based on its tangible and intangible assets. This approach is particularly relevant for companies with significant intellectual property or other valuable assets.
- **Valuation:** ${abv}
👉 Jaikaran S values ${companyName} at ${abv} using the ABV method.
`,
            page3: `
# Conclusion

Based on the four valuation methodologies—Discounted Cash Flow (DCF), Comparable Company Analysis (CCA), Precedent Transaction Method (PTM), and Asset-Based Valuation (ABV)—the estimated value of ${companyName} ranges between ${ptm} and ${abv}.

Jaikaran S recommends considering the following factors to arrive at a fair and strategic valuation for ${companyName}:
1. The company's growth potential and scalability in its target market.
2. The strength of its intellectual property and technological assets.
3. Market trends and investor sentiment in the industry.

This valuation report is a foundation for strategic decision-making, whether for fundraising, mergers and acquisitions, or internal planning purposes.

---

## Prepared by

Jaikaran S
Email: jaikaran.pesce@gmail.com

## Disclaimer

This report is intended solely for the use of ${companyName} and its authorized representatives. The valuations provided are based on the information available at the time of analysis and are subject to change based on market conditions, additional data, or other factors. Jaikaran S assumes no liability for decisions made based on this report.
`
        };
        
        // Generate specific recommendations based on company description
        try {
            const suggestionsPrompt = `
Based on this company description, generate 3 specific valuation factors to consider (one sentence each):
"${companyDescription}"

Format your response as just 3 numbered points, with no introduction or explanation.
`;

            const suggestionsResponse = await axios.post(
                'https://api.deepseek.com/v1/chat/completions',
                {
                    model: 'deepseek-chat',
                    messages: [{ role: 'user', content: suggestionsPrompt }],
                    max_tokens: 300
                },
                {
                    headers: {
                        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            const suggestions = suggestionsResponse.data.choices[0]?.message?.content;
            
            if (suggestions) {
                // Replace the generic recommendations with specific ones
                reportTemplate.page3 = reportTemplate.page3.replace(
                    "1. The company's growth potential and scalability in its target market.\n2. The strength of its intellectual property and technological assets.\n3. Market trends and investor sentiment in the industry.",
                    suggestions
                );
            }
        } catch (error) {
            console.error('❌ Failed to get custom suggestions, using defaults');
            // Continue with default suggestions if this fails
        }
        
        // Combine all pages into a single report with page markers
        const fullReport = {
            page1: reportTemplate.page1,
            page2: reportTemplate.page2,
            page3: reportTemplate.page3
        };
        
        res.json({ report: fullReport });
    } catch (error) {
        console.error('❌ Error:', error.response ? error.response.data : error.message);
        
        // Fallback with a basic format if API fails
        const date = new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        const basicReport = {
            page1: `
# Valuation Report

Produced By: Jaikaran S
Date: ${date}

## About Jaikaran S

Jaikaran S is an engineering student with a unique blend of technical acumen and entrepreneurial drive. Proficient in full-stack development, he's not just building software, he's building solutions. His entrepreneurial mindset fuels his passion for creating and launching innovative ventures. Jaikaran's diverse interests, including dance, music, and swimming, reflect his belief in a well-rounded and dynamic approach to life. He's constantly seeking opportunities to learn, grow, and make a meaningful impact.

## About ${companyName}

${companyDescription}

## Service Provided

Jaikaran S has been engaged to provide a comprehensive valuation service for ${companyName}. This report outlines the valuation methodologies employed, the results derived, and the conclusions drawn to determine the fair value of ${companyName}.
`,
            page2: `
# Valuation Methodologies

## Method 1: Discounted Cash Flow (DCF)

- **Description:**
The Discounted Cash Flow (DCF) method estimates the value of ${companyName} based on its projected future cash flows, discounted to their present value using an appropriate discount rate. This approach reflects the company's ability to generate cash flows over time and accounts for the time value of money.
- **Valuation:** ${dcf}
👉 Jaikaran S values ${companyName} at ${dcf} using the DCF method.

## Method 2: Comparable Company Analysis (CCA)

- **Description:**
The Comparable Company Analysis (CCA) method values ${companyName} by comparing it to similar companies in the industry. Key financial metrics and valuation multiples are analyzed to derive a fair market value.
- **Valuation:** ${cca}
👉 Jaikaran S values ${companyName} at ${cca} using the CCA method.

## Method 3: Precedent Transaction Method (PTM)

- **Description:**
The Precedent Transaction Method (PTM) evaluates ${companyName} based on the purchase prices of similar companies in recent transactions. This method provides insight into the premiums paid for comparable businesses in the market.
- **Valuation:** ${ptm}
👉 Jaikaran S values ${companyName} at ${ptm} using the PTM method.

## Method 4: Asset-Based Valuation (ABV)

- **Description:**
The Asset-Based Valuation (ABV) method calculates the value of ${companyName} based on its tangible and intangible assets. This approach is particularly relevant for companies with significant intellectual property or other valuable assets.
- **Valuation:** ${abv}
👉 Jaikaran S values ${companyName} at ${abv} using the ABV method.
`,
            page3: `
# Conclusion

Based on the four valuation methodologies—Discounted Cash Flow (DCF), Comparable Company Analysis (CCA), Precedent Transaction Method (PTM), and Asset-Based Valuation (ABV)—the estimated value of ${companyName} ranges between ${ptm} and ${abv}.

Jaikaran S recommends considering the following factors to arrive at a fair and strategic valuation for ${companyName}:
1. The company's growth potential and scalability in its target market.
2. The strength of its intellectual property and technological assets.
3. Market trends and investor sentiment in the industry.

This valuation report is a foundation for strategic decision-making, whether for fundraising, mergers and acquisitions, or internal planning purposes.

---

## Prepared by

Jaikaran S
Email: jaikaran.pesce@gmail.com

## Disclaimer

This report is intended solely for the use of ${companyName} and its authorized representatives. The valuations provided are based on the information available at the time of analysis and are subject to change based on market conditions, additional data, or other factors. Jaikaran S assumes no liability for decisions made based on this report.
`
        };
        
        res.json({ report: basicReport });
    }
});

app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
});

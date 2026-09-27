import sys
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def build_pitch_deck():
    prs = Presentation()
    # 16:9 Widescreen
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    
    # Theme Colors
    BG_DARK = RGBColor(11, 17, 32)        # #0B1120
    CARD_BG = RGBColor(22, 33, 62)        # #16213E
    CARD_BORDER = RGBColor(37, 99, 235)   # #2563EB
    CYAN_ACCENT = RGBColor(56, 189, 248)  # #38BDF8
    PURPLE_ACCENT = RGBColor(168, 85, 247)# #A855F7
    GREEN_ACCENT = RGBColor(74, 222, 128) # #4ADE80
    RED_ACCENT = RGBColor(248, 113, 113)  # #F87171
    TEXT_WHITE = RGBColor(255, 255, 255)
    TEXT_MUTED = RGBColor(148, 163, 184)  # #94A3B8

    def set_slide_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background()
        return bg

    def add_header(slide, title_text, category_text="PASHA DEVPILOT // IBM BOB HACKATHON"):
        # Category / Tag
        tag_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.4))
        tf = tag_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = category_text.upper()
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = CYAN_ACCENT

        # Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(11.7), Inches(0.8))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.size = Pt(26)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_WHITE

    blank_layout = prs.slide_layouts[6]

    # ==========================================
    # SLIDE 1: TITLE SLIDE
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background(s1)

    # Accent badge
    badge = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.2), Inches(3.8), Inches(0.45))
    badge.fill.solid()
    badge.fill.fore_color.rgb = CARD_BG
    badge.line.color.rgb = CYAN_ACCENT
    badge.text_frame.text = "⚡ IBM BOB HACKATHON 2026"
    badge.text_frame.paragraphs[0].font.size = Pt(12)
    badge.text_frame.paragraphs[0].font.bold = True
    badge.text_frame.paragraphs[0].font.color.rgb = CYAN_ACCENT
    badge.text_frame.paragraphs[0].alignment = PP_ALIGN.CENTER

    # Hero Title
    t_box = s1.shapes.add_textbox(Inches(0.8), Inches(1.8), Inches(11.7), Inches(1.8))
    tf = t_box.text_frame
    p1 = tf.paragraphs[0]
    p1.text = "PASHA DEVPILOT"
    p1.font.size = Pt(54)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE
    
    p2 = tf.add_paragraph()
    p2.text = "Autonomous AI Software Engineer with Strict Human-in-the-Loop Governance"
    p2.font.size = Pt(22)
    p2.font.color.rgb = CYAN_ACCENT

    # Pitch description
    desc_box = s1.shapes.add_textbox(Inches(0.8), Inches(3.8), Inches(11.7), Inches(1.2))
    p_desc = desc_box.text_frame.paragraphs[0]
    p_desc.text = "Moving AI beyond passive chat windows into end-to-end SDLC autonomy. DevPilot inspects repositories, plans architectural remedies, verifies code in sandboxed execution environments, and pushes validated pull requests."
    p_desc.font.size = Pt(16)
    p_desc.font.color.rgb = TEXT_MUTED

    # 3 Stat Cards on Title Slide
    stats = [
        ("IBM Bob Powered", "Primary AI Provider", CYAN_ACCENT),
        ("7-State Engine", "Fully Autonomous Pipeline", PURPLE_ACCENT),
        ("100% Verified", "Self-Healing Test Sandbox", GREEN_ACCENT)
    ]
    for idx, (head, sub, color) in enumerate(stats):
        x = Inches(0.8 + idx * 4.0)
        card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, Inches(5.3), Inches(3.7), Inches(1.4))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = color
        
        tf_c = card.text_frame
        tf_c.vertical_anchor = MSO_ANCHOR.MIDDLE
        p_c1 = tf_c.paragraphs[0]
        p_c1.text = head
        p_c1.font.size = Pt(18)
        p_c1.font.bold = True
        p_c1.font.color.rgb = TEXT_WHITE
        p_c1.alignment = PP_ALIGN.CENTER
        
        p_c2 = tf_c.add_paragraph()
        p_c2.text = sub
        p_c2.font.size = Pt(12)
        p_c2.font.color.rgb = color
        p_c2.alignment = PP_ALIGN.CENTER

    # ==========================================
    # SLIDE 2: THE PROBLEM
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background(s2)
    add_header(s2, "The Core Problem: AI Chatbots Don't Build Software", "Industry Bottleneck")

    problems = [
        ("1. The Copy-Paste Abyss", "Developers spend 80% of their time copying snippets between chat windows, IDEs, and terminals, introducing copy-paste bugs.", RED_ACCENT),
        ("2. No Verification / Broken Tests", "Standard LLMs generate untested hallucinations that break production suites. They have no concept of whether tests actually pass.", RED_ACCENT),
        ("3. The 'Black Box' Security Risk", "Autonomous agents that touch files without approval or run destructive shell commands pose catastrophic security risks to enterprise codebases.", RED_ACCENT)
    ]
    for idx, (title, text, col) in enumerate(problems):
        y = Inches(1.8 + idx * 1.7)
        card = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), y, Inches(11.7), Inches(1.4))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = col
        
        tf = card.text_frame
        tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.size = Pt(18)
        p1.font.bold = True
        p1.font.color.rgb = col
        
        p2 = tf.add_paragraph()
        p2.text = text
        p2.font.size = Pt(14)
        p2.font.color.rgb = TEXT_WHITE

    # ==========================================
    # SLIDE 3: THE SOLUTION - PASHA DEVPILOT
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background(s3)
    add_header(s3, "The Solution: Pasha DevPilot SDLC Platform", "Next-Gen AI Engineering")

    solutions = [
        ("Autonomous Pipeline", "7-state execution machine driving code from AST scan to Git PR.", CYAN_ACCENT),
        ("IBM Bob Integration", "Leveraging IBM Bob as primary code reasoning engine with system preambles.", PURPLE_ACCENT),
        ("Human Approval Gate", "Explicit human sign-off required before a single line of code is touched.", GREEN_ACCENT),
        ("Self-Healing Verification", "Runs real test suites (pytest/jest) and autonomously fixes bugs up to 3x.", CYAN_ACCENT),
        ("Isolated Sandbox", "Restricted execution blocking destructive binaries and unauthorized paths.", PURPLE_ACCENT),
        ("Monaco Diff Workspace", "Interactive review workspace with color-coded unified visual diffs & 1-click Push.", GREEN_ACCENT)
    ]
    for idx, (title, text, col) in enumerate(solutions):
        row = idx // 3
        col_idx = idx % 3
        x = Inches(0.8 + col_idx * 4.0)
        y = Inches(1.8 + row * 2.5)
        
        card = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(3.7), Inches(2.2))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = col
        
        tf = card.text_frame
        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.size = Pt(16)
        p1.font.bold = True
        p1.font.color.rgb = col
        
        p2 = tf.add_paragraph()
        p2.text = text
        p2.font.size = Pt(13)
        p2.font.color.rgb = TEXT_WHITE

    # ==========================================
    # SLIDE 4: THE 7-STATE ORCHESTRATOR
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background(s4)
    add_header(s4, "The 7-State Autonomous Architecture", "Agent Orchestration")

    pipeline_steps = [
        ("1. UNDERSTANDING", "Parses repository tree & extracts AST symbols across files.", CYAN_ACCENT),
        ("2. INVESTIGATING", "Generates comprehensive 20-section architectural finding report.", CYAN_ACCENT),
        ("3. PLANNING", "Produces structured step-by-step implementation roadmap.", CYAN_ACCENT),
        ("4. APPROVAL GATE", "Halts execution. Human review & explicit sign-off required.", GREEN_ACCENT),
        ("5. IMPLEMENTING", "Applies clean unified diffs inside isolated execution sandbox.", PURPLE_ACCENT),
        ("6. VERIFYING", "Runs real test runner; auto-diagnoses & fixes failing tests.", PURPLE_ACCENT),
        ("7. REVIEWING", "Monaco diff editor, change justification, 1-Click Commit & Push.", GREEN_ACCENT)
    ]
    for idx, (name, desc, col) in enumerate(pipeline_steps):
        y = Inches(1.6 + idx * 0.78)
        card = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), y, Inches(11.7), Inches(0.68))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = col
        
        tf = card.text_frame
        tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        p = tf.paragraphs[0]
        p.text = f"{name}   ―   {desc}"
        p.font.size = Pt(13)
        p.font.color.rgb = TEXT_WHITE
        p.font.bold = True

    # ==========================================
    # SLIDE 5: IBM BOB INTEGRATION
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background(s5)
    add_header(s5, "Deep IBM Bob Integration & Clean Architecture", "AI Model Core")

    bob_points = [
        ("Native BobProvider", "Specialized provider extending BaseAIProvider with custom DevPilot SDLC system prompts and structured code generation templates.", CYAN_ACCENT),
        ("Dynamic ModelRouter", "Automatically prioritizes IBM Bob (bob-code-plus) when BOB_API_KEY is present, with resilient multi-tier fallbacks.", PURPLE_ACCENT),
        ("CleanAPIs & Fallback Mesh", "Enterprise-grade resilience supporting high-concurrency verification pipelines without downtime.", GREEN_ACCENT),
        ("Transparent UI Attribution", "Model badges on dashboard, tasks, and settings explicitly reflect the active AI provider.", CYAN_ACCENT)
    ]
    for idx, (title, text, col) in enumerate(bob_points):
        row = idx // 2
        col_idx = idx % 2
        x = Inches(0.8 + col_idx * 6.0)
        y = Inches(1.8 + row * 2.5)
        
        card = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(5.7), Inches(2.2))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = col
        
        tf = card.text_frame
        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.size = Pt(17)
        p1.font.bold = True
        p1.font.color.rgb = col
        
        p2 = tf.add_paragraph()
        p2.text = text
        p2.font.size = Pt(14)
        p2.font.color.rgb = TEXT_WHITE

    # ==========================================
    # SLIDE 6: SECURITY & SANDBOXING
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background(s6)
    add_header(s6, "Enterprise Security & Execution Sandbox", "Safe Autonomy")

    sec_cards = [
        ("Human Approval Gate", "The agent cannot write code or execute shell tasks until a human explicitly reviews and approves the plan.", GREEN_ACCENT),
        ("Command Allowlisting", "Dangerous commands (rm, del, shutdown, curl|bash, force push) are strictly blocked. Only approved test runners run.", CYAN_ACCENT),
        ("Directory Traversal Guards", "Execution is strictly locked to task workspaces. Any ../ attempts outside sandbox boundaries trigger immediate termination.", PURPLE_ACCENT),
        ("Zero-Leakage Token Masking", "GitHub PATs, API keys, and sensitive tokens (ghp_*, sk-*) are cryptographically redacted before reaching logs or UI.", GREEN_ACCENT)
    ]
    for idx, (title, text, col) in enumerate(sec_cards):
        row = idx // 2
        col_idx = idx % 2
        x = Inches(0.8 + col_idx * 6.0)
        y = Inches(1.8 + row * 2.5)
        
        card = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(5.7), Inches(2.2))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = col
        
        tf = card.text_frame
        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.size = Pt(17)
        p1.font.bold = True
        p1.font.color.rgb = col
        
        p2 = tf.add_paragraph()
        p2.text = text
        p2.font.size = Pt(14)
        p2.font.color.rgb = TEXT_WHITE

    # ==========================================
    # SLIDE 7: LIVE DEMO & VALIDATION
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background(s7)
    add_header(s7, "End-to-End Real World Validation", "Real Code, Real Tests")

    results = [
        ("Real AST Defect Scan", "Scanned real Python repository (laughing-octo-eureka). Detected 9 genuine bugs: inverted token expiration, discount calculation errors, and 7 pytest failures.", CYAN_ACCENT),
        ("1-Click Bulk Remediation", "⚡ Resolve All triggered autonomous task creation, plan formulation, and isolated unified diff generation.", PURPLE_ACCENT),
        ("Self-Healing Test Suite", "Agent ran pytest in sandbox, observed 7 failing assertions, self-corrected implementations, and brought test suite to 100% PASS.", GREEN_ACCENT),
        ("1-Click GitHub Integration", "Committed verified code directly to remote Git branch 'devpilot/task-0378c47f' and generated instant Pull Request URL.", CYAN_ACCENT)
    ]
    for idx, (title, text, col) in enumerate(results):
        row = idx // 2
        col_idx = idx % 2
        x = Inches(0.8 + col_idx * 6.0)
        y = Inches(1.8 + row * 2.5)
        
        card = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x, y, Inches(5.7), Inches(2.2))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = col
        
        tf = card.text_frame
        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.size = Pt(17)
        p1.font.bold = True
        p1.font.color.rgb = col
        
        p2 = tf.add_paragraph()
        p2.text = text
        p2.font.size = Pt(14)
        p2.font.color.rgb = TEXT_WHITE

    # ==========================================
    # SLIDE 8: SUMMARY & LINKS
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background(s8)
    add_header(s8, "Pasha DevPilot: The Future of Autonomous Engineering", "Summary & Links")

    concl_card = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.8), Inches(11.7), Inches(4.8))
    concl_card.fill.solid()
    concl_card.fill.fore_color.rgb = CARD_BG
    concl_card.line.color.rgb = CYAN_ACCENT

    tf = concl_card.text_frame
    p1 = tf.paragraphs[0]
    p1.text = "Built for Developers, Governed by Humans, Powered by IBM Bob."
    p1.font.size = Pt(22)
    p1.font.bold = True
    p1.font.color.rgb = CYAN_ACCENT

    bullets = [
        "Primary AI Engine: IBM Bob (bob-code-plus) via native BobProvider",
        "Repository Link: https://github.com/pasha804/pasha-devpilot",
        "Demo Target Repo: https://github.com/pasha804/laughing-octo-eureka",
        "Active Remediated Branch: devpilot/task-0378c47f (All 11 tests passing)",
        "Architecture: Next.js 15 App Router + FastAPI Async + Monaco Editor + Sandboxed Execution",
        "Status: 100% Production Ready & Deployed for IBM Bob Hackathon 2026"
    ]
    for b in bullets:
        p = tf.add_paragraph()
        p.text = f"• {b}"
        p.font.size = Pt(16)
        p.font.color.rgb = TEXT_WHITE

    output_path = os.path.join(os.getcwd(), "Pasha_DevPilot_Pitch_Deck.pptx")
    prs.save(output_path)
    print(f"PPTX successfully created at: {output_path}")

if __name__ == "__main__":
    build_pitch_deck()

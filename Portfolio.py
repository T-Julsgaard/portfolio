import os
import textwrap

def get_next_website_folder(base_path):
    counter = 1
    while True:
        folder_name = f"Website {counter}"
        full_path = os.path.join(base_path, folder_name)
        if not os.path.exists(full_path):
            return full_path
        counter += 1

def build_website():
    # --- CONFIGURATION ---
    desktop_path = r"C:\Users\thoma\Desktop"
    
    if not os.path.exists(desktop_path):
        desktop_path = os.getcwd()
    
    base_path = get_next_website_folder(desktop_path)
    images_path = os.path.join(base_path, "images")
    pdfs_path = os.path.join(base_path, "pdfs")
    
    user_name = "Thomas Julsgaard"
    
    # IMAGES
    profile_image_index = "Profile.png"       # Frontpage
    profile_image_profile = "Profile 2.jpeg"  # Profile Page
    
    # Filenames
    bsc_certificate_file = "Thomas Julsgaard, BSc, Teknoantropologi [redacted CPR].pdf"
    tutor_certificate_file = "Tutor certificate 2023.pdf"
    
    # Social Links
    linkedin_url = "https://www.linkedin.com/in/thomasjulsgaard/"
    github_url = "https://github.com/T-Julsgaard"
    
    # --- PROJECT DATA ---
    projects = [
        {
            "id": "transcending",
            "title": "Transcending the Disciplinary Divide",
            "subtitle": "Digital Methods & Interactional Expertise",
            "img": "Transcending the disciplinary divide.png",
            "pdf": "Transcending the disciplinary divide.pdf",
            "tags": ["Network Analysis", "Scopus", "Epistemology"],
            "summary": "Investigating how digital methods can guide 'interactional expertise' to bridge gaps between distinct scientific disciplines.",
            "context": "Interdisciplinary collaboration is crucial in post-normal science, yet experts often lack a shared language. We explored how to identify 'blind spots' between disciplines.",
            "methods": "Co-occurrence network analysis of 1,500 Scopus articles on Bitcoin mining combined with qualitative expert group interviews with energy engineers.",
            "outcomes": "Developed a method to visualize disciplinary heterogeneity, allowing Techno-Anthropologists to strategically target where 'bridges' need to be built between experts."
        },
        {
            "id": "wegovy",
            "title": "Wegovy: a matter of fa(c)t?",
            "subtitle": "A Digital Ethnography",
            "img": "Wegovy a matter of fact.png",
            "pdf": "Wegovy a matter of fact.pdf",
            "tags": ["Digital Methods", "Controversy Mapping", "ANT"],
            "summary": "Tracing the socio-technical controversies of the weight-loss drug Wegovy across six different digital platforms.",
            "context": "Wegovy is not just a medical molecule; it is a cultural phenomenon intervening in concepts of body image, economics, and health policy.",
            "methods": "Scraped 150,000+ data points from Reddit, X, Mumsnet, and Scopus. Applied Actor-Network Theory (Latour's 'Matters of Concern') and network visualization.",
            "outcomes": "Mapped how the 'fact' of Wegovy mutates across platforms—from a financial asset on X to a lifestyle struggle on Mumsnet—revealing it as a heterogenous network rather than a singular product."
        },
        {
            "id": "sorte-boks",
            "title": "Den sorte boks i den hvide verden",
            "subtitle": "AI in Radiology: A Praxiographic Analysis",
            "img": "Den sorte boks i den hvide verden.png",
            "pdf": "Den sorte boks i den hvide verden.pdf",
            "tags": ["Praxiography", "Clinical AI", "Healthcare"],
            "summary": "An investigation into how Artificial Intelligence is practiced differently by developers, administrators, and clinicians.",
            "context": "AI is often presented as a solution to healthcare pressure, but 'AI' means different things to a hospital director vs. a radiologist.",
            "methods": "Praxiography (Annemarie Mol) based on interviews with actors from RAIT, Radiobotics, and Herlev-Gentofte Hospital.",
            "outcomes": "Identified conflicting 'logics' (Market vs. Professional vs. Administrative). Developed a translation tool to help stakeholders align their expectations of AI implementation."
        },
        {
            "id": "vr-sion",
            "title": "Hvilken VR-sion af dig?",
            "subtitle": "Virtual Ethnography in VRChat",
            "img": "Hvilken VR-sion af dig.png",
            "pdf": "Hvilken VR-sion af dig.pdf",
            "tags": ["Virtual Ethnography", "Postphenomenology", "Identity"],
            "summary": "Exploring how social identity and bodily experience are reconstructed inside the virtual worlds of VRChat.",
            "context": "Social VR is not just a game but a space for identity formation, particularly for socially marginalized individuals.",
            "methods": "Avatar-based ethnography and interviews within VRChat, analyzed through Verbeek’s postphenomenological framework.",
            "outcomes": "Documented the phenomenon of 'Phantom Touch' and how users leverage virtual anonymity to perform and eventually integrate new aspects of their physical identity."
        },
        {
            "id": "bussen",
            "title": "Så kører bussen, selv",
            "subtitle": "Participatory Technology Assessment",
            "img": "Så kører bussen, selv.png",
            "pdf": "Så kører bussen, selv.pdf",
            "tags": ["Autonomous Vehicles", "Citizen Summit", "PTA"],
            "summary": "A democratic assessment of self-driving buses, focusing on trust, safety, and social accessibility.",
            "context": "The transition to autonomous public transport is often driven by technology, overlooking the social reality of the passengers.",
            "methods": "Organized a 'Citizen Summit' (Borgertopmøde) combined with expert interviews (Movia, Holo) to facilitate democratic debate.",
            "outcomes": "Concluded that passengers prioritize flexibility and cybersecurity over futuristic 'pods', recommending a gradual implementation strategy to build social trust."
        },
        {
            "id": "plantebaseret",
            "title": "Meningstilskrivelser af plantebaseret kød",
            "subtitle": "Understanding Stigmatization",
            "img": "Meningstilskrivelser af plantebaseret kød.png",
            "pdf": "Meningstilskrivelser af plantebaseret kød.pdf",
            "tags": ["Food Studies", "Mixed Methods", "Stigma"],
            "summary": "Investigating the social stigma surrounding plant-based meat alternatives among Danish consumers.",
            "context": "Despite climate goals, young Danes struggle to change dietary habits. We investigated the social friction of ordering 'fake meat'.",
            "methods": "Mixed methods approach utilizing a quantitative survey (n=954) and qualitative semi-structured interviews.",
            "outcomes": "Found a correlation between diet type and felt stigmatization. Omnivores associate meat with 'tradition' and 'masculinity', creating a social barrier for adopting plant-based alternatives."
        }
    ]

    # --- EXPERIENCE DATA ---
    experiences = [
        {
            "role_en": "Co-founder", "role_da": "Medstifter",
            "company": "Nordic Mining", "period": "Feb 2024 – Jul 2025",
            "logo": "Nordic mining logo.png",
            "desc_en": "Developed a model to assess the profitability of flexible data centers in green energy grids. Modeled in collaboration with Energistyrelsen.<br><br>Selected for the AAU Innovator Hub incubation program.",
            "desc_da": "Udviklede model til vurdering af fleksible datacentres bidrag til profitabilitet af grøn energi. Modelleret i samarbejde med Energistyrelsen.<br><br>Optaget i AAU Innovator Hub (inkubationsprogram)."
        },
        {
            "role_en": "Head of Technical Support", "role_da": "Leder af teknisk support",
            "company": "Introtech Ventures", "period": "Sep 2024 – Feb 2025",
            "logo": "Introtech logo.png",
            "desc_en": "Responsible for providing guidance and support to the operating teams, as well as overseeing key initiatives and ensuring task follow-up.<br><br>Provideded strategic guidance and advice on growth plans to drive business expansion, assess the competitive landscape, and advise senior management on key initiatives.",
            "desc_da": "Ansvarlig for at yde vejledning og support til driftsteamet samt for at overvåge centrale initiativer og sikre opfølgning på opgaver.<br><br>Ydede strategisk rådgivning og vejledning om vækstplaner med henblik på at drive forretningsudvikling, vurdere konkurrencesituationen og rådgive den øverste ledelse om centrale initiativer."
        },
        {
            "role_en": "Fundraiser", "role_da": "Fundraiser",
            "company": "UNICEF", "period": "Nov 2023 – Jan 2024",
            "logo": "Unicef logo.png",
            "desc_en": "Direct engagement and fundraising for humanitarian aid initiatives.",
            "desc_da": "Direkte engagement og fundraising til humanitære hjælpeinitiativer."
        },
        {
            "role_en": "Substitute Teacher", "role_da": "Lærervikar",
            "company": "Artium", "period": "Jan 2022 – Jun 2022",
            "logo": "Artium logo.PNG",
            "desc_en": "Classroom management and educational support.",
            "desc_da": "Klasseledelse og faglig støtte."
        },
        {
            "role_en": "Social Care Assistant", "role_da": "Pædagogmedhjælper",
            "company": "Brande Åbo", "period": "Jan 2021 – Aug 2021",
            "logo": "Brande åbo logo.png",
            "desc_en": "Pedagogical support and care for residents with physical and mental disabilities.",
            "desc_da": "Pædagogisk støtte og omsorg for beboere med fysiske og psykiske funktionsnedsættelser."
        }
    ]

    # --- COMPETENCIES (Updated with Danish translations) ---
    competencies_list = [
        {"en": "Ethnographic methods", "da": "Etnografiske metoder"},
        {"en": "Qualitative & quantitative methods", "da": "Kvalitative & kvantitative metoder"},
        {"en": "User involvement", "da": "Brugerinddragelse"},
        {"en": "Interviewing", "da": "Interviewteknik"},
        {"en": "AI alignment", "da": "AI alignment"},
        {"en": "UI/UX research", "da": "UI/UX research"},
        {"en": "Human-centered design", "da": "Brugercentreret design"},
        {"en": "Participatory technology assessment & design", "da": "Participatorisk teknologivurdering & design"},
        {"en": "Data scraping", "da": "Data scraping"},
        {"en": "Network analysis", "da": "Netværksanalyse"},
        {"en": "Data visualization", "da": "Datavisualisering"},
        {"en": "Gephi", "da": "Gephi"},
        {"en": "Philosophy of technology", "da": "Teknologifilosofi"},
        {"en": "Life-cycle assessment (LCA)", "da": "Livscyklusvurdering (LCA)"},
        {"en": "Problem-based learning (PBL)", "da": "Problembaseret læring (PBL)"},
        {"en": "Adobe Photoshop / Premiere Pro", "da": "Adobe Photoshop / Premiere Pro"}
    ]

    # --- HTML HEAD ---
    def get_head(page_title):
        return f"""
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{page_title} | {user_name}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;800&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
            <script>
                tailwind.config = {{
                    theme: {{
                        extend: {{
                            fontFamily: {{
                                sans: ['Inter', 'sans-serif'],
                                mono: ['Space Grotesk', 'monospace'],
                            }},
                            colors: {{
                                stone: {{ 50: '#fafaf9', 100: '#f5f5f4', 200: '#e7e5e4', 800: '#292524', 900: '#1c1917' }},
                                teal: {{ 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a' }}
                            }},
                            animation: {{
                                'fade-up': 'fadeUp 0.8s ease-out forwards',
                            }},
                            keyframes: {{
                                fadeUp: {{
                                    '0%': {{ opacity: '0', transform: 'translateY(15px)' }},
                                    '100%': {{ opacity: '1', transform: 'translateY(0)' }},
                                }},
                                popOut: {{
                                    '0%': {{ transform: 'scale(1)' }},
                                    '40%': {{ transform: 'scale(1.15)' }},
                                    '100%': {{ transform: 'scale(0)', opacity: '0' }},
                                }}
                            }}
                        }}
                    }}
                }}
            </script>
            <style>
                html {{ scroll-behavior: smooth; }}
                .reveal {{ opacity: 0; transform: translateY(30px); transition: all 0.8s cubic-bezier(0.5, 0, 0, 1); }}
                .reveal.active {{ opacity: 1; transform: translateY(0); }}
                .project-card:hover {{ transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05); }}
                .skill-card {{ transition: all 0.3s ease; }}
                .skill-card:hover {{ border-color: #0d9488; transform: translateY(-3px); }}
                .hidden {{ display: none; }}
                #mobile-menu {{ transition: max-height 0.3s ease-in-out; max-height: 0; overflow: hidden; }}
                #mobile-menu.open {{ max-height: 100vh; }}
                .pop-out {{ animation: popOut 0.4s ease-in forwards !important; pointer-events: none; }}
                .exp-logo {{ transition: transform 0.3s ease; }}
                .exp-logo:hover {{ transform: scale(1.05); }}
                .modern-input {{ width: 100%; background-color: #fafaf9; border: none; border-radius: 8px; padding: 16px; font-size: 0.95rem; color: #1c1917; box-shadow: inset 0 1px 2px rgba(0,0,0,0.06); transition: all 0.2s ease; }}
                .modern-input:focus {{ background-color: #ffffff; box-shadow: 0 0 0 2px #0d9488, 0 4px 6px -1px rgba(0, 0, 0, 0.1); outline: none; }}
                .modern-label {{ display: block; font-family: 'Space Grotesk', monospace; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #57534e; margin-bottom: 0.5rem; font-weight: 700; }}
                #runaway-btn {{ position: absolute; transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1); left: 1.5rem; top: 0; }}
            </style>
        </head>
        """

    # --- NAVIGATION ---
    def get_nav(active_page):
        links = {
            "index.html": ("Index", "Forside"),
            "casestudies.html": ("Case Studies", "Case studier"),
            "experience.html": ("Work Experience", "Arbejdserfaring"),
            "profile.html": ("Profile", "Profil"),
            "contact.html": ("Contact", "Kontakt")
        }
        
        nav_items_html = ""
        for link, (en, da) in links.items():
            active_class = "text-stone-900 border-b-2 border-teal-600 font-semibold" if link == active_page else "text-stone-500 hover:text-teal-600"
            nav_items_html += f"""
            <a href="{link}" class="font-mono text-sm uppercase tracking-widest py-1 transition-all duration-300 {active_class}">
                <span class="lang-en">{en}</span><span class="lang-da hidden">{da}</span>
            </a>
            """

        mobile_nav_html = ""
        for link, (en, da) in links.items():
            mobile_nav_html += f"""
            <a href="{link}" class="block py-3 border-b border-stone-100 font-mono text-sm uppercase tracking-widest text-stone-600 hover:text-teal-600">
                <span class="lang-en">{en}</span><span class="lang-da hidden">{da}</span>
            </a>
            """
        
        return f"""
        <nav class="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-stone-200">
            <div class="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
                <a href="index.html" class="font-mono font-bold text-lg tracking-tighter group text-stone-900">
                    T_Julsgaard<span class="text-teal-600">.exe</span>
                </a>
                
                <div class="hidden md:flex items-center gap-8">
                    <div class="flex gap-8">
                        {nav_items_html}
                    </div>
                    <div class="flex items-center gap-2 font-mono text-xs border border-stone-200 rounded-full px-1 py-1">
                        <button onclick="setLang('en')" id="btn-en" class="px-3 py-1 rounded-full transition-colors bg-stone-900 text-white">EN</button>
                        <button onclick="setLang('da')" id="btn-da" class="px-3 py-1 rounded-full transition-colors text-stone-500 hover:text-stone-900">DA</button>
                    </div>
                </div>

                <div class="md:hidden flex items-center gap-4">
                    <div class="flex items-center gap-1 font-mono text-[10px] border border-stone-200 rounded-full px-1 py-1">
                        <button onclick="setLang('en')" id="btn-en-mob" class="px-2 py-1 rounded-full transition-colors bg-stone-900 text-white">EN</button>
                        <button onclick="setLang('da')" id="btn-da-mob" class="px-2 py-1 rounded-full transition-colors text-stone-500 hover:text-stone-900">DA</button>
                    </div>
                    <button id="mobile-menu-btn" class="text-stone-900 focus:outline-none">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                </div>
            </div>

            <div id="mobile-menu" class="md:hidden bg-white border-b border-stone-200 px-6">
                {mobile_nav_html}
            </div>
        </nav>
        """

    def get_footer():
        return f"""
        <footer class="bg-stone-900 text-stone-400 py-16 mt-20 relative z-10">
            <div class="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-8">
                <div class="mb-4 md:mb-0">
                    <h3 class="font-mono text-stone-100 text-lg mb-2">{user_name}</h3>
                    <p class="font-light text-sm max-w-xs">
                        <span class="lang-en">Techno-Anthropologist.</span>
                        <span class="lang-da hidden">Teknoantropolog.</span>
                    </p>
                </div>
                <div class="flex flex-wrap gap-6 font-mono text-sm">
                    <a href="contact.html" class="hover:text-teal-400 transition"><span class="lang-en">Contact</span><span class="lang-da hidden">Kontakt</span></a>
                </div>
            </div>
        </footer>
        <script>
            function setLang(lang) {{
                sessionStorage.setItem('preferredLang', lang);
                const enElements = document.querySelectorAll('.lang-en');
                const daElements = document.querySelectorAll('.lang-da');
                const btnEn = document.getElementById('btn-en');
                const btnDa = document.getElementById('btn-da');
                const btnEnMob = document.getElementById('btn-en-mob');
                const btnDaMob = document.getElementById('btn-da-mob');

                if (lang === 'da') {{
                    enElements.forEach(el => el.classList.add('hidden'));
                    daElements.forEach(el => el.classList.remove('hidden'));
                    [btnDa, btnDaMob].forEach(b => {{ if(b) {{ b.classList.add('bg-stone-900', 'text-white'); b.classList.remove('text-stone-500'); }} }});
                    [btnEn, btnEnMob].forEach(b => {{ if(b) {{ b.classList.remove('bg-stone-900', 'text-white'); b.classList.add('text-stone-500'); }} }});
                }} else {{
                    daElements.forEach(el => el.classList.add('hidden'));
                    enElements.forEach(el => el.classList.remove('hidden'));
                    [btnEn, btnEnMob].forEach(b => {{ if(b) {{ b.classList.add('bg-stone-900', 'text-white'); b.classList.remove('text-stone-500'); }} }});
                    [btnDa, btnDaMob].forEach(b => {{ if(b) {{ b.classList.remove('bg-stone-900', 'text-white'); b.classList.add('text-stone-500'); }} }});
                }}
            }}

            document.addEventListener('DOMContentLoaded', () => {{
                const savedLang = sessionStorage.getItem('preferredLang') || 'en';
                setLang(savedLang);
                
                const observer = new IntersectionObserver((entries) => {{
                    entries.forEach(entry => {{
                        if (entry.isIntersecting) entry.target.classList.add('active');
                    }});
                }}, {{ threshold: 0.1 }});
                document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

                const menuBtn = document.getElementById('mobile-menu-btn');
                const mobileMenu = document.getElementById('mobile-menu');
                menuBtn.addEventListener('click', () => {{
                    mobileMenu.classList.toggle('open');
                }});
            }});
        </script>
        """

    # --- 1. INDEX PAGE ---
    featured_indices = [0, 4, 2]
    featured_html = ""
    for idx in featured_indices:
        p = projects[idx]
        order_class = "md:order-1" if featured_indices.index(idx) % 2 == 0 else "md:order-2"
        text_order = "md:order-2" if featured_indices.index(idx) % 2 == 0 else "md:order-1"
        
        featured_html += f"""
        <div class="group grid md:grid-cols-12 gap-8 md:gap-16 items-center reveal mb-32 last:mb-0">
            <div class="md:col-span-6 {order_class} relative">
                <a href="casestudies.html#{p['id']}" class="block overflow-hidden rounded shadow-lg hover:shadow-2xl transition-all duration-500">
                    <div class="relative aspect-[3/4] bg-stone-200">
                        <img src="images/{p['img']}" alt="{p['title']}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                    </div>
                </a>
            </div>
            <div class="md:col-span-6 {text_order}">
                <div class="flex flex-wrap gap-2 mb-4">
                    {' '.join([f'<span class="font-mono text-teal-600 text-xs uppercase tracking-widest border border-teal-600/20 px-2 py-1 rounded">{t}</span>' for t in p['tags']])}
                </div>
                <h3 class="text-3xl md:text-4xl font-bold mb-4 leading-tight text-stone-900">{p['title']}</h3>
                <p class="font-mono text-sm text-stone-400 mb-6 uppercase tracking-wide">{p['subtitle']}</p>
                <p class="text-stone-600 mb-8 leading-relaxed text-lg font-light">{p['summary']}</p>
                <a href="casestudies.html#{p['id']}" class="inline-flex items-center gap-2 border-b border-stone-900 pb-1 font-mono hover:text-teal-600 hover:border-teal-600 transition group-hover:pl-2">
                    <span class="lang-en">Read Report</span><span class="lang-da hidden">Læs Rapport</span> <span class="text-lg">&rarr;</span>
                </a>
            </div>
        </div>
        """

    index_page = f"""
    <!DOCTYPE html>
    <html lang="en">
    {get_head("Home")}
    <body class="bg-stone-50 text-stone-900 pt-20">
        {get_nav("index.html")}
        <main class="max-w-6xl mx-auto px-6">
            <section class="grid md:grid-cols-2 gap-12 items-start pt-10 md:pt-20 pb-16">
                <div class="order-2 md:order-1 relative z-10 animate-fade-up">
                    <p class="font-mono text-teal-700 mb-6 tracking-widest text-sm uppercase font-bold">Techno-Anthropologist</p>
                    <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tighter mb-8 max-w-2xl text-stone-900">
                        <span class="lang-en">Bridging the gap<br>between data<br>and <span class="text-transparent bg-clip-text bg-gradient-to-r from-stone-900 to-teal-900">human insight.</span></span>
                        <span class="lang-da hidden">Brobygger<br>mellem data og<br><span class="whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-stone-900 to-teal-900">menneskelig indsigt.</span></span>
                    </h1>
                    <p class="text-lg md:text-xl text-stone-600 max-w-2xl font-light leading-relaxed border-l-2 border-teal-600 pl-6 mt-8">
                        <span class="lang-en">My strength lies in speaking both 'developer' and 'user'. I translate complex technical systems into concrete design and organizational strategies.</span>
                        <span class="lang-da hidden">Min styrke ligger i at tale både 'udvikler' og 'bruger'. Jeg oversætter komplekse tekniske systemer til konkrete designs og organisatoriske strategier.</span>
                    </p>
                    <div id="prank-container" class="relative mt-6 w-full max-w-4xl h-96 border border-transparent">
                        <button id="runaway-btn" class="hidden md:inline-block bg-stone-900 text-white px-8 py-4 rounded-full font-mono text-xs uppercase tracking-widest shadow-lg cursor-pointer whitespace-nowrap hover:bg-teal-600">
                            <span class="lang-en">Hire as unpaid intern</span><span class="lang-da hidden">Ansæt som ulønnet praktikant</span>
                        </button>
                    </div>
                </div>
                <div class="order-1 md:order-2 flex flex-col justify-center items-center md:items-end animate-fade-up" style="animation-delay: 0.2s;">
                    <h2 class="text-xl font-extrabold text-stone-900 mb-2 tracking-tight self-start md:self-end cursor-default">{user_name}</h2>
                    <div class="group relative w-full max-w-md aspect-square">
                        <div class="absolute inset-0 border-2 border-stone-800 translate-x-4 translate-y-4 transition-transform duration-500 group-hover:translate-x-2 group-hover:translate-y-2"></div>
                        <div class="relative w-full h-full overflow-hidden bg-stone-200 shadow-xl">
                            <img src="images/{profile_image_index}" class="w-full h-full object-cover transition-all duration-700 filter grayscale group-hover:grayscale-0 group-hover:scale-105" alt="Thomas Julsgaard">
                        </div>
                    </div>
                </div>
            </section>
            <section class="pt-2 pb-10">
                <div class="flex justify-between items-end mb-20 reveal border-b border-stone-200 pb-8">
                    <h2 class="text-3xl md:text-4xl font-bold text-stone-900">
                        <span class="lang-en">Selected Work</span><span class="lang-da hidden">Udvalgte Projekter</span>
                    </h2>
                </div>
                {featured_html}
                <div class="text-center mt-24 reveal">
                    <a href="casestudies.html" class="inline-block px-10 py-4 bg-stone-900 text-stone-50 rounded-full font-mono text-sm hover:bg-teal-600 transition duration-300">
                        <span class="lang-en">View All Case Studies</span><span class="lang-da hidden">Se Alle Case Studier</span>
                    </a>
                </div>
            </section>
        </main>
        {get_footer()}
        <script>
            document.addEventListener('DOMContentLoaded', () => {{
                const btn = document.getElementById('runaway-btn');
                const container = document.getElementById('prank-container');
                let isCooldown = false;
                let btnX = 0;
                let btnY = 0;
                if(btn && container) {{
                    const triggerMove = (mouseX, mouseY) => {{
                        if (isCooldown) return;
                        const btnRect = btn.getBoundingClientRect();
                        const containerRect = container.getBoundingClientRect();
                        const btnCenterX = btnRect.left + btnRect.width / 2;
                        const btnCenterY = btnRect.top + btnRect.height / 2;
                        let dirX = btnCenterX - mouseX;
                        let dirY = btnCenterY - mouseY;
                        if (dirX === 0 && dirY === 0) {{ dirX = 1; dirY = 1; }}
                        const length = Math.sqrt(dirX * dirX + dirY * dirY);
                        const normX = dirX / length;
                        const normY = dirY / length;
                        const jumpDistance = 150; 
                        btnX += normX * jumpDistance;
                        btnY += normY * jumpDistance;
                        if (Math.abs(btnX) > containerRect.width/2 - 50) btnX *= -0.5;
                        if (Math.abs(btnY) > containerRect.height - 50) btnY *= -0.5;
                        btn.style.transform = `translate(${{btnX}}px, ${{btnY}}px)`;
                        isCooldown = true;
                        setTimeout(() => {{ isCooldown = false; }}, 400); 
                    }};
                    container.addEventListener('mousemove', (e) => {{
                        const btnRect = btn.getBoundingClientRect();
                        const btnCenterX = btnRect.left + btnRect.width / 2;
                        const btnCenterY = btnRect.top + btnRect.height / 2;
                        const dist = Math.sqrt(Math.pow(e.clientX - btnCenterX, 2) + Math.pow(e.clientY - btnCenterY, 2));
                        if (dist < 100) triggerMove(e.clientX, e.clientY);
                    }});
                    const runAway = (e) => {{
                        e.preventDefault();
                        let clientX = e.clientX;
                        let clientY = e.clientY;
                        if(e.type === 'touchstart' && e.touches.length > 0) {{
                             clientX = e.touches[0].clientX;
                             clientY = e.touches[0].clientY;
                        }}
                        triggerMove(clientX, clientY);
                    }};
                    btn.addEventListener('click', runAway);
                    btn.addEventListener('touchstart', runAway);
                }}
            }});
        </script>
    </body>
    </html>
    """

    # --- 2. CASE STUDIES PAGE ---
    projects_list_html = ""
    for p in projects:
        projects_list_html += f"""
        <article id="{p['id']}" class="bg-white rounded-xl shadow-sm border border-stone-100 reveal overflow-hidden mb-16 scroll-mt-32 project-card transition-all duration-300">
            <div class="grid md:grid-cols-12">
                <div class="md:col-span-4 bg-stone-100 relative h-64 md:h-auto md:min-h-full group cursor-pointer" onclick="window.open('pdfs/{p['pdf']}', '_blank')">
                    <img src="images/{p['img']}" alt="{p['title']}" class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90">
                    <div class="absolute inset-0 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 bg-stone-900/40">
                         <span class="bg-white text-stone-900 px-4 py-2 rounded font-mono text-xs uppercase tracking-widest">
                            <span class="lang-en">Read PDF</span><span class="lang-da hidden">Læs PDF</span>
                         </span>
                    </div>
                </div>
                <div class="md:col-span-8 p-8 md:p-12 flex flex-col justify-center">
                    <div class="flex justify-between items-start mb-6">
                        <div class="flex flex-wrap gap-2">
                            {' '.join([f'<span class="text-xs font-mono uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-1 rounded">{tag}</span>' for tag in p['tags']])}
                        </div>
                        <a href="pdfs/{p['pdf']}" target="_blank" class="text-stone-400 hover:text-teal-600 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </a>
                    </div>
                    <h2 class="text-3xl md:text-4xl font-bold mb-2 text-stone-900">{p['title']}</h2>
                    <p class="text-lg text-stone-500 mb-8 font-light italic">{p['subtitle']}</p>
                    <p class="text-stone-800 mb-8 leading-relaxed font-medium">{p['summary']}</p>
                    <div class="grid md:grid-cols-3 gap-8 pt-8 border-t border-stone-100">
                        <div>
                             <h4 class="font-mono text-xs font-bold text-stone-900 mb-2 uppercase tracking-wider">
                                <span class="lang-en">Context</span><span class="lang-da hidden">Kontekst</span>
                             </h4>
                             <p class="text-stone-600 text-sm leading-relaxed">{p['context']}</p>
                        </div>
                        <div>
                            <h4 class="font-mono text-xs font-bold text-stone-900 mb-2 uppercase tracking-wider">
                                <span class="lang-en">Methods</span><span class="lang-da hidden">Metoder</span>
                            </h4>
                            <p class="text-stone-600 text-sm leading-relaxed">{p['methods']}</p>
                        </div>
                        <div>
                            <h4 class="font-mono text-xs font-bold text-stone-900 mb-2 uppercase tracking-wider">
                                <span class="lang-en">Outcomes</span><span class="lang-da hidden">Resultater</span>
                            </h4>
                            <p class="text-stone-600 text-sm leading-relaxed">{p['outcomes']}</p>
                        </div>
                    </div>
                    <div class="mt-8 pt-4">
                        <a href="pdfs/{p['pdf']}" target="_blank" class="inline-block bg-stone-900 text-white px-6 py-3 rounded-md font-mono text-xs uppercase tracking-widest hover:bg-teal-600 transition">
                            <span class="lang-en">Download Report</span><span class="lang-da hidden">Download Rapport</span>
                        </a>
                    </div>
                </div>
            </div>
        </article>
        """

    casestudies_page = f"""
    <!DOCTYPE html>
    <html lang="en">
    {get_head("Case Studies")}
    <body class="bg-stone-50 text-stone-900 pt-20">
        {get_nav("casestudies.html")}
        <main class="max-w-6xl mx-auto px-6 py-20">
            <header class="mb-24 reveal">
                <h1 class="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-stone-900">
                    <span class="lang-en">Case Studies</span><span class="lang-da hidden">Case Studier</span>
                </h1>
                <p class="text-xl text-stone-600 font-light max-w-2xl leading-relaxed">
                    <span class="lang-en">A collection of research into socio-technical networks, participatory design, and digital ethnography.</span>
                    <span class="lang-da hidden">En samling af forskning inden for socio-tekniske netværk, deltagende design og digital etnografi.</span>
                </p>
            </header>
            <div class="space-y-12">{projects_list_html}</div>
        </main>
        {get_footer()}
    </body>
    </html>
    """

    # --- 3. EXPERIENCE PAGE ---
    experience_list_html = ""
    for exp in experiences:
        experience_list_html += f"""
        <div class="relative pl-8 md:pl-0 mb-16 reveal">
            <div class="hidden md:block absolute left-[50%] top-0 bottom-0 w-px bg-stone-300 transform -translate-x-1/2"></div>
            <div class="grid md:grid-cols-2 gap-8 md:gap-16 relative">
                <div class="hidden md:block absolute left-[50%] top-2 w-3 h-3 bg-stone-900 rounded-full transform -translate-x-1/2 border-4 border-stone-50"></div>
                <div class="md:text-right md:pr-8 flex flex-col md:items-end items-center">
                    <span class="inline-block px-3 py-1 bg-stone-200 text-stone-600 rounded-full text-xs font-mono font-bold mb-4">{exp['period']}</span>
                    <div class="flex justify-center w-full md:justify-end">
                        <img src="images/{exp['logo']}" class="exp-logo h-12 w-auto max-w-[120px] object-contain">
                    </div>
                </div>
                <div class="md:pl-8">
                    <h3 class="text-2xl font-bold text-stone-900">
                        <span class="lang-en">{exp['role_en']}</span><span class="lang-da hidden">{exp['role_da']}</span>
                    </h3>
                    <p class="text-teal-700 font-medium mb-3">{exp['company']}</p>
                    <p class="text-stone-600 leading-relaxed max-w-lg">
                        <span class="lang-en">{exp['desc_en']}</span><span class="lang-da hidden">{exp['desc_da']}</span>
                    </p>
                </div>
            </div>
        </div>
        """

    experience_page = f"""
    <!DOCTYPE html>
    <html lang="en">
    {get_head("Experience")}
    <body class="bg-stone-50 text-stone-900 pt-20">
        {get_nav("experience.html")}
        <main class="max-w-5xl mx-auto px-6 py-20">
            <header class="mb-20 reveal text-center">
                <h1 class="text-4xl md:text-6xl font-bold mb-6 text-stone-900">
                    <span class="lang-en">Work Experience</span><span class="lang-da hidden">Arbejdserfaring</span>
                </h1>
            </header>
            <div class="relative py-10 max-w-4xl mx-auto">{experience_list_html}</div>
        </main>
        {get_footer()}
    </body>
    </html>
    """

    # --- 4. PROFILE PAGE (Heavily updated with translations) ---
    skills_grid = ""
    for skill in competencies_list:
        skills_grid += f"""
        <div class="skill-card p-4 border border-stone-200 rounded-lg bg-white hover:shadow-md flex items-center justify-center text-center">
            <h4 class="font-medium text-stone-800 text-sm">
                <span class="lang-en">{skill['en']}</span>
                <span class="lang-da hidden">{skill['da']}</span>
            </h4>
        </div>
        """

    profile_page = f"""
    <!DOCTYPE html>
    <html lang="en">
    {get_head("Profile")}
    <body class="bg-stone-50 text-stone-900 pt-20">
        {get_nav("profile.html")}
        <main class="max-w-6xl mx-auto px-6 py-20">
            <div class="flex flex-col md:flex-row gap-12 items-stretch mb-24 reveal">
                <div class="md:w-5/12">
                    <div class="relative w-full h-full overflow-hidden rounded-lg shadow-lg group min-h-[400px]">
                         <img src="images/{profile_image_profile}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                         <div class="absolute inset-0 bg-stone-900/10 group-hover:bg-transparent transition-colors duration-500"></div>
                    </div>
                </div>
                <div class="md:w-7/12 flex flex-col justify-between">
                    <div class="p-8 bg-stone-100 rounded-xl border-l-4 border-teal-600 h-full flex flex-col justify-center">
                        <h3 class="text-lg font-bold uppercase tracking-widest text-stone-500 mb-6">
                            <span class="lang-en">Education</span><span class="lang-da hidden">Uddannelse</span>
                        </h3>
                        
                        <div class="mb-8">
                            <div class="flex justify-between items-baseline mb-2">
                                <h4 class="text-xl font-bold text-stone-900">
                                    <span class="lang-en">BSc, Techno-Anthropology</span>
                                    <span class="lang-da hidden">BSc, Teknoantropologi</span>
                                </h4>
                                <span class="text-sm font-mono text-stone-500">2022 – 2025</span>
                            </div>
                            <p class="text-teal-700 font-medium mb-2">
                                <span class="lang-en">Aalborg University, Copenhagen</span>
                                <span class="lang-da hidden">Aalborg Universitet, København</span>
                            </p>
                            <p class="text-stone-600 text-sm mb-4">
                                <span class="lang-en">Weighted avg: 11.3 (Danish 7-scale) / ~3.9 GPA equivalent.</span>
                                <span class="lang-da hidden">Vægtet gennemsnit: 11,3 (7-trins-skala).</span>
                            </p>
                            <a href="pdfs/{bsc_certificate_file}" target="_blank" class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-900 border-b border-stone-300 hover:text-teal-600 hover:border-teal-600 transition">
                                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                <span class="lang-en">Download Certificate</span><span class="lang-da hidden">Hent Bevis</span>
                            </a>
                        </div>

                        <div class="mb-8">
                            <div class="flex justify-between items-baseline mb-2">
                                <h4 class="text-xl font-bold text-stone-900">
                                    <span class="lang-en">Film Production</span>
                                    <span class="lang-da hidden">Film Produktion</span>
                                </h4>
                                <span class="text-sm font-mono text-stone-500">2021</span>
                            </div>
                            <p class="text-teal-700 font-medium mb-2">
                            <span class="lang-en">Askov Folk High School</span><span class="lang-da hidden">Askov Højskole</span></p>
                            <p class="text-stone-600 text-sm">
                                <span class="lang-en">Proficiency in the Adobe Suite (Premiere Pro, Photoshop).</span>
                                <span class="lang-da hidden">Fortrolig med Adobe-pakken (Premiere Pro, Photoshop).</span>
                            </p>
                        </div>

                         <div>
                            <div class="flex justify-between items-baseline mb-2">
                                <h4 class="text-xl font-bold text-stone-900">
                                    <span class="lang-en">IBG / Democracy & Globalization</span>
                                    <span class="lang-da hidden">IBG / Demokrati & Globalisering</span>
                                </h4>
                                <span class="text-sm font-mono text-stone-500">2017 – 2020</span>
                            </div>
                             <p class="text-teal-700 font-medium mb-2">Ikast-Brande Gymnasium</p>
                        </div>
                    </div>
                </div>
            </div>

            <section class="reveal">
                <div class="flex items-center gap-4 mb-8">
                    <div class="h-px bg-stone-300 flex-grow"></div>
                    <h2 class="font-mono text-sm font-bold uppercase tracking-widest text-stone-400">
                        <span class="lang-en">Core Competencies</span><span class="lang-da hidden">Kernekompetencer</span>
                    </h2>
                    <div class="h-px bg-stone-300 flex-grow"></div>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {skills_grid}
                </div>
            </section>
            
             <section class="reveal mt-20">
                 <h3 class="text-2xl font-bold mb-8 text-center text-stone-900">
                    <span class="lang-en">Volunteering</span><span class="lang-da hidden">Frivilligt Arbejde</span>
                 </h3>
                 <div class="grid md:grid-cols-2 gap-8">
                    <div class="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                         <div class="flex justify-between items-start mb-2">
                            <span class="font-bold text-stone-900">
                                <span class="lang-en">Vice Chairman</span><span class="lang-da hidden">Næstformand</span>
                            </span>
                            <span class="text-xs font-mono text-stone-500">
                                <span class="lang-en">Aug 2022 - Present</span><span class="lang-da hidden">Aug 2022 - Nu</span>
                            </span>
                         </div>
                        <p class="text-stone-500 text-sm">
                            <span class="lang-en">Askov Folk High School Student Association</span>
                            <span class="lang-da hidden">Askov Højskoles elevforening</span>
                        </p>
                    </div>
                    <div class="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                         <div class="flex justify-between items-start mb-2">
                            <span class="font-bold text-stone-900">
                                <span class="lang-en">Tutor</span><span class="lang-da hidden">Tutor</span>
                            </span>
                            <span class="text-xs font-mono text-stone-500">Sep 2023 - Dec 2023</span>
                         </div>
                        <p class="text-stone-500 text-sm mb-3">
                            <span class="lang-en">Aalborg University</span>
                            <span class="lang-da hidden">Aalborg Universitet</span>
                        </p>
                         <a href="pdfs/{tutor_certificate_file}" target="_blank" class="inline-flex items-center gap-1 text-xs font-bold uppercase text-teal-700 hover:text-teal-900">
                            <span class="lang-en">Download Certificate</span><span class="lang-da hidden">Hent Bevis</span> &darr;
                        </a>
                    </div>
                 </div>
            </section>
        </main>
        {get_footer()}
    </body>
    </html>
    """

    # --- 5. CONTACT PAGE ---
    contact_page = f"""
    <!DOCTYPE html>
    <html lang="en">
    {get_head("Contact")}
    <body class="bg-stone-50 text-stone-900 pt-20 flex flex-col min-h-screen">
        {get_nav("contact.html")}
        <main class="flex-grow flex items-center justify-center px-6 py-20">
            <div class="max-w-6xl w-full reveal">
                <div class="grid md:grid-cols-2 gap-16 items-start">
                    <div>
                        <p class="font-mono text-teal-600 mb-6 tracking-widest uppercase">Contact</p>
                        <h1 class="text-5xl md:text-6xl font-bold mb-8 tracking-tight text-stone-900 whitespace-nowrap">
                            <span class="lang-en">Let's get in touch.</span><span class="lang-da hidden">Lad os tage en snak.</span>
                        </h1>
                        <p class="text-xl text-stone-600 mb-12 font-light leading-relaxed">
                            <span class="lang-en">I am always open to discussing research collaborations, consultancy opportunities, or new projects.</span>
                            <span class="lang-da hidden">Jeg er altid åben for at diskutere forskningssamarbejder, konsulentmuligheder eller nye projekter.</span>
                        </p>
                        <div class="flex flex-col gap-4">
                            <a href="{linkedin_url}" target="_blank" class="flex items-center gap-4 group p-4 border border-stone-200 rounded-lg bg-white hover:border-teal-500 transition-all duration-300">
                                <div class="w-10 h-10 flex items-center justify-center bg-stone-100 rounded-full group-hover:bg-teal-50">
                                    <svg class="w-5 h-5 text-stone-600 group-hover:text-teal-700" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                </div>
                                <span class="font-mono text-sm uppercase tracking-wider text-stone-600 group-hover:text-stone-900">/thomasjulsgaard</span>
                            </a>
                            <a href="{github_url}" target="_blank" class="flex items-center gap-4 group p-4 border border-stone-200 rounded-lg bg-white hover:border-teal-500 transition-all duration-300">
                                <div class="w-10 h-10 flex items-center justify-center bg-stone-100 rounded-full group-hover:bg-teal-50">
                                    <svg class="w-5 h-5 text-stone-600 group-hover:text-teal-700" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                                </div>
                                <span class="font-mono text-sm uppercase tracking-wider text-stone-600 group-hover:text-stone-900">/T-Julsgaard</span>
                            </a>
                        </div>
                    </div>
                    <div class="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
                        <form action="https://formspree.io/f/YOUR_FORM_ID_HERE" method="POST" class="space-y-6">
                            <input type="text" name="_gotcha" style="display:none">
                            <div class="grid grid-cols-2 gap-6">
                                <div>
                                    <label class="modern-label">
                                        <span class="lang-en">Name</span><span class="lang-da hidden">Navn</span>
                                    </label>
                                    <input type="text" name="name" required class="modern-input">
                                </div>
                                <div>
                                    <label class="modern-label">Email</label>
                                    <input type="email" name="_replyto" required class="modern-input">
                                </div>
                            </div>
                            <div>
                                <label class="modern-label">
                                    <span class="lang-en">Subject</span><span class="lang-da hidden">Emne</span>
                                </label>
                                <input type="text" name="subject" class="modern-input">
                            </div>
                            <div>
                                <label class="modern-label">
                                    <span class="lang-en">Message</span><span class="lang-da hidden">Besked</span>
                                </label>
                                <textarea name="message" required rows="5" class="modern-input"></textarea>
                            </div>
                            <button type="submit" class="w-full bg-stone-900 text-white py-4 rounded-lg font-mono text-xs uppercase tracking-widest hover:bg-teal-600 transition-colors duration-300 shadow-lg">
                                <span class="lang-en">Send Message</span><span class="lang-da hidden">Send Besked</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
        {get_footer()}
    </body>
    </html>
    """

    # --- EXECUTION ---
    os.makedirs(base_path, exist_ok=True)
    os.makedirs(images_path, exist_ok=True)
    os.makedirs(pdfs_path, exist_ok=True)

    files = {
        "index.html": index_page,
        "casestudies.html": casestudies_page,
        "experience.html": experience_page,
        "profile.html": profile_page,
        "contact.html": contact_page
    }

    for filename, content in files.items():
        with open(os.path.join(base_path, filename), "w", encoding="utf-8") as f:
            f.write(textwrap.dedent(content).strip())

    print("-" * 60)
    print(f"SUCCESS: Website generated at: {base_path}")
    print("-" * 60)

if __name__ == "__main__":
    build_website()
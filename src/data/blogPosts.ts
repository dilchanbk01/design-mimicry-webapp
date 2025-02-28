
import { BlogPost, BlogCategory } from "@/types/blog";

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "pet_events_in_bangalore",
    title: "Top 5 Pet Events in Bangalore You Cannot Miss",
    excerpt: "Discover the most exciting pet events happening in Bangalore this year that every pet parent should attend.",
    content: `
      <p>Bangalore has become a hub for pet lovers, with numerous events catering specifically to pets and their owners. If you're a pet parent in Bangalore, here are five events you absolutely cannot miss:</p>
      
      <h3>1. Bangalore Pet Expo</h3>
      <p>The annual Bangalore Pet Expo brings together pet owners, veterinarians, pet product manufacturers, and animal welfare organizations. This two-day event showcases the latest in pet care technology, nutrition, and accessories. Visitors can attend workshops on pet training, health, and wellness. The expo also features adoption drives for homeless pets.</p>
      
      <h3>2. Woofstock Festival</h3>
      <p>Inspired by the famous music festival, Woofstock is a celebration of dogs and their humans. This outdoor event includes dog agility contests, fashion shows, and pet-friendly food stalls. Live music creates a festive atmosphere while your furry friend socializes with other dogs. Don't miss the "Lookalike Contest" where dogs and owners who resemble each other compete for fun prizes!</p>
      
      <h3>3. Paws for a Cause Walkathon</h3>
      <p>This charity event raises funds for animal shelters and rescue organizations in Bangalore. Participants walk with their pets through scenic routes in the city, creating awareness about animal welfare. The event concludes with refreshments, pet games, and adoption opportunities for rescued animals.</p>
      
      <h3>4. Pet Fed Bangalore</h3>
      <p>India's biggest pet festival makes a regular stop in Bangalore. Pet Fed features competitive events like dog agility courses and cat shows, along with play zones where pets can explore obstacle courses and swimming pools. The festival also offers pet health check-ups, microchipping services, and consultations with pet nutritionists.</p>
      
      <h3>5. Bangalore Aqua Pet Show</h3>
      <p>For aquatic pet enthusiasts, this unique show displays exotic fish, aquascaping techniques, and the latest in aquarium technology. Experts conduct sessions on fish care, breeding, and aquarium maintenance. Visitors can purchase rare species of fish, aquatic plants, and specialized equipment.</p>
      
      <p>Mark your calendars for these fantastic events that celebrate the bond between pets and their humans. Not only will your pet have a great time socializing, but you'll also connect with fellow pet lovers and gain valuable insights into pet care.</p>
    `,
    imageUrl: "/lovable-uploads/3ff4430d-913b-49ff-9efc-06a1dda0fa4c.png",
    publishedDate: "2023-09-15",
    category: "events",
    tags: ["bangalore", "pet events", "dogs", "cats", "exhibitions"]
  },
  {
    id: "2",
    slug: "essential_grooming_tips_for_dogs",
    title: "Essential Grooming Tips Every Dog Owner Should Know",
    excerpt: "Learn the fundamentals of dog grooming that will keep your furry friend healthy, clean, and happy.",
    content: `
      <p>Regular grooming is essential for your dog's health and well-being. Beyond just keeping your pet looking good, proper grooming prevents skin issues, helps detect early signs of health problems, and strengthens your bond. Here are essential grooming tips every dog owner should follow:</p>
      
      <h3>Brushing Essentials</h3>
      <p>Different coat types require different brushing techniques and tools:</p>
      <ul>
        <li><strong>Short-haired breeds</strong>: Use a rubber brush or grooming mitt weekly to remove loose hair and distribute skin oils.</li>
        <li><strong>Medium to long-haired breeds</strong>: Brush 2-3 times weekly with slicker brushes and undercoat rakes to prevent matting.</li>
        <li><strong>Curly or wool-coated breeds</strong>: Require almost daily brushing with specialized brushes to prevent painful tangles.</li>
      </ul>
      <p>Always brush in the direction of hair growth and be gentle around sensitive areas.</p>
      
      <h3>Bathing Best Practices</h3>
      <p>Most dogs only need bathing once a month, though this varies by breed and lifestyle. When bathing your dog:</p>
      <ul>
        <li>Use lukewarm water and dog-specific shampoo (never human shampoo)</li>
        <li>Protect eyes and ears from water and soap</li>
        <li>Rinse thoroughly—residual shampoo can cause skin irritation</li>
        <li>Dry completely, especially in areas prone to moisture retention</li>
      </ul>
      
      <h3>Nail Care</h3>
      <p>Overgrown nails can cause pain and affect your dog's gait. Trim nails every 3-4 weeks, being careful to avoid the quick (the pink area containing blood vessels). If you're uncomfortable trimming nails, professional groomers or veterinarians can help.</p>
      
      <h3>Ear Cleaning</h3>
      <p>Check ears weekly for redness, swelling, discharge, or odor. Clean the outer ear with a veterinarian-approved solution and cotton ball. Never insert anything into the ear canal or use cotton swabs, which can damage the ear or push debris deeper.</p>
      
      <h3>Dental Care</h3>
      <p>Dental health affects overall health. Brush your dog's teeth several times a week with dog-specific toothpaste. Dental chews and professional cleanings also help maintain oral hygiene.</p>
      
      <h3>Professional Grooming</h3>
      <p>Even with regular home care, most dogs benefit from professional grooming every 4-8 weeks. Professionals can handle tricky areas like sanitary trimming and provide breed-specific cuts.</p>
      
      <p>Remember, grooming should be a positive experience. Start grooming routines when your dog is young, use treats and praise, and keep sessions short at first. With patience and consistency, most dogs learn to enjoy, or at least tolerate, grooming time.</p>
    `,
    imageUrl: "/lovable-uploads/8f3aed90-73d6-4c1e-ab8b-639261a42d22.png",
    publishedDate: "2023-10-20",
    category: "grooming",
    tags: ["dog grooming", "pet care", "brushing", "bathing"]
  },
  {
    id: "3",
    slug: "cat_grooming_guide",
    title: "The Complete Cat Grooming Guide: Keeping Your Feline Friend Purr-fect",
    excerpt: "Discover the best practices for grooming cats of all coat types and temperaments.",
    content: `
      <p>Contrary to popular belief, cats do need grooming assistance despite their self-cleaning habits. Proper grooming prevents hairballs, detects health issues early, and keeps your cat's coat healthy and shiny. Here's your complete guide to cat grooming:</p>
      
      <h3>Brushing Different Coat Types</h3>
      <p>Regular brushing removes loose hair, prevents matting, and reduces hairballs:</p>
      <ul>
        <li><strong>Shorthaired cats</strong>: Brush once a week with a fine-toothed metal comb or rubber brush.</li>
        <li><strong>Medium to longhaired cats</strong>: Brush 2-3 times weekly using a wide-toothed comb for the outer coat and a finer comb for the undercoat.</li>
        <li><strong>Cats with special coats (Rex, Sphynx, etc.)</strong>: Follow breed-specific grooming recommendations.</li>
      </ul>
      
      <h3>Bathing Tips (Yes, Some Cats Need Baths)</h3>
      <p>While most cats rarely need baths, certain situations call for one:</p>
      <ul>
        <li>When they've gotten into something sticky or dirty</li>
        <li>For cats with skin conditions (as directed by a vet)</li>
        <li>For show cats or certain longhaired breeds</li>
      </ul>
      <p>When bathing is necessary:</p>
      <ul>
        <li>Use lukewarm water and cat-specific shampoo</li>
        <li>Place a non-slip mat in the tub or sink</li>
        <li>Speak calmly and reward with treats</li>
        <li>Rinse thoroughly and dry completely</li>
      </ul>
      
      <h3>Nail Trimming</h3>
      <p>Trim your cat's nails every 2-3 weeks. Use cat-specific nail trimmers and cut only the white tip, avoiding the pink quick. If your cat resists, try wrapping them in a towel with one paw extended at a time, or ask your veterinarian to demonstrate proper technique.</p>
      
      <h3>Ear Care</h3>
      <p>Check ears weekly for dirt, wax buildup, or signs of infection. Clean only the visible part of the ear with a veterinarian-approved solution and cotton ball. Never insert anything into the ear canal.</p>
      
      <h3>Dental Health</h3>
      <p>Dental disease is common in cats. Brush your cat's teeth with feline toothpaste, offer dental treats, and schedule professional cleanings as recommended by your veterinarian.</p>
      
      <h3>Eye Care</h3>
      <p>Some cats, particularly flat-faced breeds, may develop eye discharge. Gently wipe around the eyes with a damp cotton ball, using a separate ball for each eye to prevent cross-contamination.</p>
      
      <h3>Managing Hairballs</h3>
      <p>Regular brushing is the best prevention for hairballs. You can also offer specially formulated hairball-control food, treats, or gel supplements.</p>
      
      <h3>Professional Grooming</h3>
      <p>Consider professional grooming for longhaired cats, elderly cats, or cats with grooming challenges. Professionals can provide services like lion cuts for severely matted coats or sanitary trims.</p>
      
      <p>Remember that patience is key when grooming cats. Start with short sessions, use positive reinforcement, and gradually build tolerance. Your efforts will result in a healthier, more comfortable feline companion.</p>
    `,
    imageUrl: "/lovable-uploads/2737b2dd-8bd8-496f-8a36-6329dc70fe41.png",
    publishedDate: "2023-11-05",
    category: "grooming",
    tags: ["cat grooming", "feline care", "pet maintenance", "hairball prevention"]
  },
  {
    id: "4",
    slug: "pet_events_organization_guide",
    title: "How to Organize a Successful Pet Event: A Comprehensive Guide",
    excerpt: "Learn the essential steps to plan and execute memorable pet events that participants will love.",
    content: `
      <p>Organizing a pet event requires careful planning and attention to detail to ensure both pets and their owners have a safe, enjoyable experience. Whether you're planning a small neighborhood dog walk or a large-scale pet exhibition, this guide will help you create a successful event.</p>
      
      <h3>Define Your Event Purpose and Target Audience</h3>
      <p>Start by clearly defining what type of event you want to create:</p>
      <ul>
        <li>Fundraiser for animal welfare</li>
        <li>Educational workshop</li>
        <li>Social gathering for pet owners</li>
        <li>Adoption drive</li>
        <li>Pet competition or show</li>
      </ul>
      <p>Your purpose will guide decisions about venue, activities, and promotion. Also consider which pets your event will accommodate—dogs only, cats, all pets, or specific breeds.</p>
      
      <h3>Select an Appropriate Venue</h3>
      <p>The ideal venue should be:</p>
      <ul>
        <li>Pet-friendly with proper permissions</li>
        <li>Spacious enough for the expected attendance</li>
        <li>Secure with controlled entry/exit points</li>
        <li>Equipped with shade and shelter options</li>
        <li>Accessible with adequate parking</li>
        <li>Compliant with local regulations</li>
      </ul>
      <p>Parks, pet stores, community centers, and specialized event venues are common choices.</p>
      
      <h3>Plan for Pet Safety and Comfort</h3>
      <p>Safety should be your top priority:</p>
      <ul>
        <li>Establish clear rules about leashing, vaccination requirements, and behavior</li>
        <li>Have a veterinarian on-site or on call</li>
        <li>Create quiet zones where overwhelmed pets can retreat</li>
        <li>Provide ample water stations and waste disposal options</li>
        <li>Consider weather conditions and have contingency plans</li>
        <li>Prepare a first-aid kit for both humans and pets</li>
      </ul>
      
      <h3>Design Engaging Activities</h3>
      <p>Successful pet events offer activities for both pets and owners:</p>
      <ul>
        <li>Contests (best trick, costume, lookalike)</li>
        <li>Agility courses or games</li>
        <li>Educational demonstrations</li>
        <li>Photo booths</li>
        <li>Vendor booths for pet products and services</li>
        <li>Refreshments for humans and pet-friendly treats</li>
      </ul>
      
      <h3>Recruit a Reliable Team</h3>
      <p>You'll need volunteers or staff for:</p>
      <ul>
        <li>Registration and check-in</li>
        <li>Activity supervision</li>
        <li>Safety monitoring</li>
        <li>Photography and social media</li>
        <li>Cleanup crew</li>
      </ul>
      <p>Brief your team thoroughly about their responsibilities and emergency procedures.</p>
      
      <h3>Promote Your Event Effectively</h3>
      <p>Spread the word through:</p>
      <ul>
        <li>Social media and event listing platforms</li>
        <li>Local pet stores, veterinary clinics, and grooming salons</li>
        <li>Pet-focused online communities</li>
        <li>Local press and community bulletins</li>
        <li>Email marketing to past attendees</li>
      </ul>
      
      <h3>Secure Sponsorships and Partnerships</h3>
      <p>Local businesses often welcome the opportunity to sponsor pet events. Approach pet food companies, veterinary practices, grooming salons, and pet stores for sponsorships or in-kind donations.</p>
      
      <h3>Handle Registration and Documentation</h3>
      <p>Create a streamlined registration process that collects essential information. Consider using online registration platforms with electronic waivers. Prepare photography release forms if you'll be sharing images.</p>
      
      <h3>Evaluate and Improve</h3>
      <p>After your event, collect feedback from participants, sponsors, and volunteers. Document what worked well and what could be improved. This information will be invaluable for planning future events.</p>
      
      <p>By following these guidelines, you'll create a memorable pet event that participants will look forward to attending year after year.</p>
    `,
    imageUrl: "/lovable-uploads/3ff4430d-913b-49ff-9efc-06a1dda0fa4c.png",
    publishedDate: "2023-12-12",
    category: "events",
    tags: ["event planning", "pet events", "community", "organization guide"]
  },
  {
    id: "5",
    slug: "grooming_tools_essentials",
    title: "Essential Grooming Tools Every Pet Owner Should Have",
    excerpt: "Discover the must-have grooming tools that will make pet care easier and more effective.",
    content: `
      <p>Proper grooming is essential for pet health and happiness, but it can be overwhelming to know which tools are truly necessary. This guide breaks down the essential grooming tools every pet owner should have in their collection.</p>
      
      <h3>Brushes and Combs</h3>
      <p>Different coat types require different brushes:</p>
      <ul>
        <li><strong>Slicker Brush</strong>: Perfect for removing loose fur and detangling. Essential for medium to long-haired pets.</li>
        <li><strong>Undercoat Rake</strong>: Designed to reach the dense undercoat of double-coated breeds like German Shepherds, Huskies, and many cats.</li>
        <li><strong>Bristle Brush</strong>: Ideal for short-haired pets to remove loose hair and distribute natural oils.</li>
        <li><strong>Pin Brush</strong>: Works well for pets with medium to long silky coats.</li>
        <li><strong>Grooming Mitt</strong>: A good starting point for pets that are sensitive to traditional brushes.</li>
        <li><strong>Fine-tooth Comb</strong>: Essential for checking for fleas and removing small mats.</li>
      </ul>
      
      <h3>Nail Care Tools</h3>
      <p>Regular nail trimming is crucial for pet comfort and health:</p>
      <ul>
        <li><strong>Guillotine Clippers</strong>: Easy to use for small to medium pets.</li>
        <li><strong>Scissor Clippers</strong>: Provide more control and are better for large pets.</li>
        <li><strong>Grinder</strong>: Gradually files nails down instead of cutting them, reducing the risk of hitting the quick.</li>
        <li><strong>Styptic Powder</strong>: Essential for stopping bleeding if you accidentally cut the quick.</li>
      </ul>
      
      <h3>Bathing Supplies</h3>
      <p>For effective and stress-free bathing:</p>
      <ul>
        <li><strong>Species-specific Shampoo</strong>: Never use human products on pets.</li>
        <li><strong>Conditioner</strong>: Essential for long-haired pets to prevent tangles.</li>
        <li><strong>Non-slip Mat</strong>: Provides secure footing during baths.</li>
        <li><strong>Sprayer Attachment</strong>: Makes rinsing much easier and more thorough.</li>
        <li><strong>Absorbent Towels</strong>: Microfiber towels are particularly effective.</li>
        <li><strong>Pet Hair Dryer</strong>: Optional but useful, especially for thick-coated breeds.</li>
      </ul>
      
      <h3>Ear and Eye Care</h3>
      <p>Gentle but thorough cleaning prevents infections:</p>
      <ul>
        <li><strong>Ear Cleaning Solution</strong>: Veterinarian-approved for your specific pet.</li>
        <li><strong>Cotton Balls</strong>: For applying solution and wiping outer ear areas.</li>
        <li><strong>Eye Wipes</strong>: Specially formulated to safely clean around eyes.</li>
      </ul>
      
      <h3>Dental Care Tools</h3>
      <p>Oral health affects overall health:</p>
      <ul>
        <li><strong>Pet Toothbrush</strong>: Finger brushes work well for beginners.</li>
        <li><strong>Pet Toothpaste</strong>: Never use human toothpaste, which contains harmful ingredients for pets.</li>
        <li><strong>Dental Chews</strong>: Supplement brushing with approved dental treats.</li>
      </ul>
      
      <h3>Hair Removal Tools</h3>
      <p>Keep your home and clothes pet-hair free:</p>
      <ul>
        <li><strong>Deshedding Tool</strong>: Reduces shedding by removing loose undercoat hair.</li>
        <li><strong>Lint Roller</strong>: For quick cleanup of pet hair on clothing and furniture.</li>
        <li><strong>Pet Hair Vacuum Attachment</strong>: Makes home cleaning more efficient.</li>
      </ul>
      
      <h3>Grooming Restraints and Comfort Items</h3>
      <p>For safety and reduced stress:</p>
      <ul>
        <li><strong>Grooming Table</strong>: Optional but provides stability for medium to large pets.</li>
        <li><strong>No-slip Mat</strong>: Essential for bathing and grooming on slippery surfaces.</li>
        <li><strong>Grooming Arm</strong>: Keeps pet secure during detailed grooming.</li>
        <li><strong>Treats</strong>: Create positive associations with grooming.</li>
      </ul>
      
      <h3>Storage Solutions</h3>
      <p>Keep your tools organized and accessible:</p>
      <ul>
        <li><strong>Grooming Caddy or Bag</strong>: Keeps all supplies in one place.</li>
        <li><strong>Tool Sanitizer</strong>: Clean tools between uses for hygiene.</li>
      </ul>
      
      <p>Start with the basics for your pet's specific needs and gradually expand your collection. Quality tools may cost more initially but will last longer and work more effectively. Most importantly, introduce new grooming tools gradually and positively to ensure your pet develops a good relationship with grooming time.</p>
    `,
    imageUrl: "/lovable-uploads/8f3aed90-73d6-4c1e-ab8b-639261a42d22.png",
    publishedDate: "2024-01-18",
    category: "grooming",
    tags: ["pet care", "grooming tools", "brushes", "nail care", "bath supplies"]
  },
  {
    id: "6",
    slug: "winter_pet_care_events",
    title: "Winter Pet Care Events: Keep Your Pet Healthy During Cold Months",
    excerpt: "Learn about upcoming winter pet care events and essential tips for keeping your pet happy and healthy during the cold season.",
    content: `
      <p>Winter presents unique challenges for pet owners. From dry skin to cold-weather hazards, our furry friends need extra attention during the chilly months. Fortunately, there are many winter pet care events designed to help pet owners navigate the season successfully. Here's a guide to upcoming events and essential winter care tips.</p>
      
      <h3>Upcoming Winter Pet Care Events</h3>
      
      <h4>Winter Wellness Clinics</h4>
      <p>Many veterinary practices and pet stores host special winter wellness clinics offering:</p>
      <ul>
        <li>Discounted wellness exams focused on winter-specific issues</li>
        <li>Coat and skin assessments</li>
        <li>Nutrition consultations for winter diet adjustments</li>
        <li>Paw care demonstrations</li>
      </ul>
      <p>Check with local veterinarians for scheduled clinic dates in your area.</p>
      
      <h4>Pet Winter Fashion Shows</h4>
      <p>These fun events showcase practical winter gear for pets while raising funds for animal welfare organizations. Attendees can:</p>
      <ul>
        <li>See demonstrations of proper winter attire fitting</li>
        <li>Learn about appropriate materials for different weather conditions</li>
        <li>Purchase quality cold-weather gear</li>
        <li>Enter their pets in fashion contests</li>
      </ul>
      
      <h4>Indoor Play Date Meetups</h4>
      <p>Since outdoor exercise can be limited during harsh weather, many communities organize indoor socialization events where:</p>
      <ul>
        <li>Pets can play in climate-controlled environments</li>
        <li>Owners can exchange winter care tips</li>
        <li>Professional trainers demonstrate indoor enrichment activities</li>
      </ul>
      <p>Look for these events at indoor dog parks, pet-friendly community centers, and pet supply stores.</p>
      
      <h4>Winter Safety Workshops</h4>
      <p>These educational events cover critical topics such as:</p>
      <ul>
        <li>Recognizing and preventing hypothermia and frostbite</li>
        <li>Safe approaches to winter walks and outdoor time</li>
        <li>Protecting pets from winter hazards (antifreeze, salt, etc.)</li>
        <li>Emergency preparedness for winter storms</li>
      </ul>
      
      <h3>Essential Winter Pet Care Tips</h3>
      
      <h4>Adjust Outdoor Time</h4>
      <p>During winter:</p>
      <ul>
        <li>Shorten walks during extreme cold</li>
        <li>Consider pet booties to protect paws from ice, salt, and chemicals</li>
        <li>Wipe paws after outdoor excursions</li>
        <li>Monitor your pet for signs of discomfort</li>
      </ul>
      
      <h4>Winter Grooming Adaptations</h4>
      <p>Proper winter grooming includes:</p>
      <ul>
        <li>Regular brushing to remove dead hair and stimulate circulation</li>
        <li>Maintaining (not shaving) protective coats</li>
        <li>Using moisturizing products for dry skin</li>
        <li>Trimming hair between paw pads to prevent ice ball accumulation</li>
      </ul>
      
      <h4>Nutrition and Hydration</h4>
      <p>Winter dietary considerations include:</p>
      <ul>
        <li>Possibly increasing calories for outdoor pets who burn more energy staying warm</li>
        <li>Ensuring constant access to fresh, unfrozen water</li>
        <li>Adding supplements like fish oil for skin and coat health (with veterinary approval)</li>
      </ul>
      
      <h4>Indoor Enrichment</h4>
      <p>Combat winter boredom with:</p>
      <ul>
        <li>New interactive toys</li>
        <li>Food puzzles that provide mental stimulation</li>
        <li>Indoor training sessions</li>
        <li>Hide-and-seek games with treats or toys</li>
      </ul>
      
      <h4>Winter Hazard Awareness</h4>
      <p>Be vigilant about:</p>
      <ul>
        <li>Antifreeze (ethylene glycol), which is lethal even in small amounts</li>
        <li>Ice-melting chemicals, which can irritate paws and be toxic if ingested</li>
        <li>Space heaters and fireplaces, which pose burn risks</li>
        <li>Holiday decorations and foods that can be hazardous to pets</li>
      </ul>
      
      <p>By attending winter pet care events and implementing these seasonal care strategies, you'll help ensure your pet stays healthy, comfortable, and happy throughout the colder months. Remember that different pets have different winter needs based on their species, breed, age, and health status, so consult with your veterinarian about the best winter care plan for your specific pet.</p>
    `,
    imageUrl: "/lovable-uploads/0de28ab3-c7d0-4f1a-93ac-e975813200de.png",
    publishedDate: "2024-02-10",
    category: "events",
    tags: ["winter pet care", "seasonal events", "pet health", "cold weather"]
  }
];

export const getPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find(post => post.slug === slug);
};

export const getPostsByCategory = (category: string): BlogPost[] => {
  return blogPosts.filter(post => post.category === category);
};

export const getRecentPosts = (count: number = 3): BlogPost[] => {
  return [...blogPosts]
    .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
    .slice(0, count);
};

export const getBlogCategories = (): BlogCategory[] => {
  return [
    { id: '1', name: 'Pet Grooming', slug: 'grooming' },
    { id: '2', name: 'Pet Events', slug: 'events' },
    { id: '3', name: 'Pet Health', slug: 'health' },
    { id: '4', name: 'Pet Training', slug: 'training' }
  ];
};

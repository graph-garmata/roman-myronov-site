export type CaseVideo = {
  mp4: string;
  webm: string;
  poster: string;
  alt?: string;
  /** Set when the file carries a real audio track. Films always start muted
   * (browsers block unmuted autoplay), but this one gets a sound toggle so
   * it can be turned on. Most case films are silent motion — leave it off
   * for those rather than offering a control that does nothing. */
  sound?: boolean;
};

export type CaseCell = (
  | { kind: "image"; src: string; alt?: string }
  | { kind: "video"; video: CaseVideo }
  | { kind: "vimeo"; vimeoId: string; alt?: string }
) & {
  /** Cell ratio (width / height), used inside a grid so each cell keeps its
   * source shape and the row's height follows from it. */
  ratio?: number;
};

export type CaseBlock =
  // `ratio` (width / height) comes from the source media so nothing is
  // cropped or letterboxed — block height varies with the material. Falls
  // back to 16:10 when omitted.
  | { type: "full"; cell: CaseCell; ratio?: number }
  | { type: "grid"; cells: CaseCell[] }
  | { type: "copy"; label: string; text: string };

export type Talent = { name: string; role: string };

export type CaseStudy = {
  slug: string;
  name: string;
  scope: string;
  talents: Talent[];
  problem: string;
  blocks: CaseBlock[];
};

const luminar: CaseStudy = {
  slug: "luminar",
  name: "Luminar",
  scope: "Strategy, Naming, Verbal Identity, Visual Identity, Website",
  talents: [
    { name: "Sam Tipikin", role: "Design Director" },
    { name: "Olha Shevchuk", role: "Copywriter" },
  ],
  problem:
    "The client came to us asking for a website. She was a volunteer delivering food, sourcing clothes, organizing events and small outings for elderly people who needed someone to show up for them. It was real, hands-on work, just without any structure behind it.",
  blocks: [
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/luminar/film-01.mp4",
          webm: "/images/luminar/film-01.webm",
          poster: "/images/luminar/film-01-poster.jpg",
          alt: "Luminar brand film",
        },
      },
    },
    {
      type: "copy",
      label: "Problem",
      text: "The client came to us asking for a website. She was a volunteer – delivering food, sourcing clothes, organizing events and small outings for elderly people who needed someone to show up for them. It was real, hands-on work, just without any structure behind it. She wanted to grow it into a foundation. So before any website work started, we began with branding – and a strategic session to figure out what this foundation was actually built on. What we found was an idea close to karmic investment, though we never wanted to spell it out that plainly in the brand itself. The premise: young people supporting this foundation aren't just helping elderly people today. They're also, in a sense, investing in their own future – caring for the kind of old age they'll one day have.",
    },
    {
      type: "copy",
      label: "Idea",
      text: "Out of the strategy session came the central metaphor: the prism. A single beam of light – one donation, one act of care – passes through the foundation like light through a prism, and comes out the other side not as one thing, but dispersed into many: a Prism of Care, a Prism of Warmth, a Prism of Kindness. What went in as a single act comes out multiplied, reaching further than the person who gave it could have reached alone. But the prism wasn't only about breadth – it was about time. Think of your life as a path moving forward. That path passes through a kind of prism of time, and just like light, it can bend – its direction shifts depending on what passes through it. What you do in the present is what bends that path. Do something good now, and the probability that your own destination bends toward something good increases too. That's the idea the whole brand sits on: what you put in today doesn't just help someone else – it bends where you end up.",
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/luminar/prism-diagram.webp",
        alt: "Space-time prism diagram: a path bending as it passes between present and future",
      },
    },
    {
      type: "copy",
      label: "Logo",
      text: "The logo reinterprets the time-prism shape and mechanic directly: two squares – present and future – are connected and form hourglass shape, passing through a space between them. That negative space shows refraction.",
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/luminar/logo.webp",
        alt: "The Luminar Foundation mark with its horizontal and vertical lockups",
      },
    },
    {
      type: "grid",
      cells: [
        {
          ratio: 1600 / 2000,
          kind: "image",
          src: "/images/luminar/hat.webp",
          alt: "Yellow bucket hat carrying the Luminar wordmark",
        },
        {
          kind: "video",
          video: {
            mp4: "/images/luminar/logo-construction.mp4",
            webm: "/images/luminar/logo-construction.webm",
            poster: "/images/luminar/logo-construction-poster.jpg",
            alt: "The mark being constructed from overlapping circles and squares",
          },
          ratio: 960 / 1200,
        },
      ],
    },
    {
      type: "copy",
      label: "Logotype",
      text: "For the logo type, we chose Margo + Beuys – slightly playful, for two reasons: older people can be surprisingly childlike, and the brand speaks to a mid-aged audience. We wanted the foundation to feel cozy and trustworthy, not corporate. That decision came from a category audit. Most existing eldercare foundations use the same visual language – heart-and-hand icons, muted blues and greens, imagery that frames aging as decline, something to be managed or prepared for. Luminar says the opposite: aging can be full of light, warmth, and life – sometimes even fun.",
    },
    {
      type: "full",
      ratio: 1920 / 1080,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/luminar/film-06.mp4",
          webm: "/images/luminar/film-06.webm",
          poster: "/images/luminar/film-06-poster.jpg",
        },
      },
    },
    {
      type: "copy",
      label: "Typeface",
      text: "We picked Cardinal Fruit, an elegant serif, to balance out logo font choice and overall visual language, bringing in the serious, credible side of the foundation's work.",
    },
    {
      type: "grid",
      cells: [
        {
          kind: "video",
          video: {
            mp4: "/images/luminar/typeface.mp4",
            webm: "/images/luminar/typeface.webm",
            poster: "/images/luminar/typeface-poster.jpg",
            alt: "Cardinal Fruit type specimen",
          },
          ratio: 960 / 1200,
        },
        {
          ratio: 1600 / 2000,
          kind: "image",
          src: "/images/luminar/mural.webp",
          alt: "Building-side mural at dusk reading From you today. To you tomorrow.",
        },
      ],
    },
    {
      type: "copy",
      label: "Slogan",
      text: 'The slogan – "From you today. To you tomorrow." – captures the brand idea in a short, creative form.',
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/luminar/film-09.mp4",
          webm: "/images/luminar/film-09.webm",
          poster: "/images/luminar/film-09-poster.jpg",
        },
      },
    },
    {
      type: "copy",
      label: "Motion",
      text: "Light was the brief — the primary interaction layer. Most decisions about motion on the Luminar website traced back to a single question: how does light move through this? It follows the cursor, collects around elements, occasionally reveals content that sat hidden until you got close. The reveals feel earned. You moved there, the light responded. The warmth is hard to pin on any single component. It works because the brand itself pushed through into every interaction.",
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/luminar/film-10.mp4",
          webm: "/images/luminar/film-10.webm",
          poster: "/images/luminar/film-10-poster.jpg",
        },
      },
    },
    {
      type: "copy",
      label: "Characters",
      text: "The ellipses and rectangles from the logo became the basis of a broader visual language, and one derivative of that was a small cast of grandparent-like characters – a way to represent the foundation's actual work more explicitly, and to create emotional connection wherever that connection is needed. At touchpoints where we wanted the brand to feel more corporate and serious, we dropped the faces entirely and worked with the yellow gradients and same shapes on their own – a more minimalistic, restrained solution for those moments.",
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/luminar/film-11.mp4",
          webm: "/images/luminar/film-11.webm",
          poster: "/images/luminar/film-11-poster.jpg",
        },
      },
    },
    {
      type: "full",
      ratio: 1600 / 2742,
      cell: {
        kind: "image",
        src: "/images/luminar/site-impact.webp",
        alt: "Website section showing where donations have already gone, above a Your Light Uncovers the Path grid",
      },
    },
    {
      type: "full",
      ratio: 1920 / 1920,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/luminar/film-13.mp4",
          webm: "/images/luminar/film-13.webm",
          poster: "/images/luminar/film-13-poster.jpg",
        },
      },
    },
    {
      type: "full",
      ratio: 1920 / 2306,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/luminar/film-14.mp4",
          webm: "/images/luminar/film-14.webm",
          poster: "/images/luminar/film-14-poster.jpg",
        },
      },
    },
    {
      type: "full",
      ratio: 1600 / 3045,
      cell: {
        kind: "image",
        src: "/images/luminar/site-programs.webp",
        alt: "Warmth in Action page listing the foundation's programs, with its mobile layouts alongside",
      },
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/luminar/film-16.mp4",
          webm: "/images/luminar/film-16.webm",
          poster: "/images/luminar/film-16-poster.jpg",
        },
      },
    },
    {
      type: "full",
      ratio: 1920 / 1080,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/luminar/film-17.mp4",
          webm: "/images/luminar/film-17.webm",
          poster: "/images/luminar/film-17-poster.jpg",
        },
      },
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "image",
        src: "/images/luminar/print.webp",
        alt: "Printed brochure spread: The Touch of Care, How You Can Help, The Path of Light",
      },
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/luminar/film-19.mp4",
          webm: "/images/luminar/film-19.webm",
          poster: "/images/luminar/film-19-poster.jpg",
        },
      },
    },
    {
      type: "copy",
      label: "Generator",
      text: "To make the visual language easier to work with – and to give it a wider range of use – we built a generative tool for creating these characters. It also let us add a game-like layer to the brand: a way to bring in more audience involvement and make the whole experience feel less transactional. The aim was to make the donation process itself more entertaining, and to give people a reason to share their own generated character – spreading the brand along with it.",
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/luminar/characters.webp",
        alt: "Grid of generated character cards across the foundation's palette",
      },
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/luminar/film-21.mp4",
          webm: "/images/luminar/film-21.webm",
          poster: "/images/luminar/film-21-poster.jpg",
        },
      },
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/luminar/app.webp",
        alt: "Phone showing a generated character inside the donation flow",
      },
    },
    {
      type: "full",
      ratio: 1920 / 1888,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/luminar/film-23.mp4",
          webm: "/images/luminar/film-23.webm",
          poster: "/images/luminar/film-23-poster.jpg",
        },
      },
    },
  ],
};

const estyl: CaseStudy = {
  slug: "estyl",
  name: "Estyl",
  scope: "Strategy, Branding, Verbal Identity, App Design",
  talents: [
    { name: "Sam Tipikin", role: "Design Director, UI/UX Designer" },
    { name: "Roman Myronov", role: "Design Director, Brand Designer" },
    { name: "Ann Datsiuk", role: "Illustrator" },
    { name: "Olha Shevchuk", role: "Creative Copywriter" },
    { name: "Ivan Hrankin", role: "Brand Strategist" },
    { name: "Maryna Mishchenko", role: "Jr. Designer" },
  ],
  problem:
    "People want help getting dressed that feels personal, not transactional. They need a way to work with the clothes they already own, express a specific vibe, and feel understood.",
  blocks: [
    {
      type: "full",
      ratio: 1920 / 1080,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/estyl/film-01.mp4",
          webm: "/images/estyl/film-01.webm",
          poster: "/images/estyl/film-01-poster.jpg",
          alt: "Estyl showreel",
          sound: true,
        },
      },
    },
    {
      type: "copy",
      label: "Problem",
      text: "People want help getting dressed that feels personal, not transactional. They need a way to work with the clothes they already own, express a specific vibe, and feel understood. Current AI tools often feel mechanical — outputs without context, taste, or emotional signal — which breaks trust and makes style advice easy to ignore.",
    },
    {
      type: "copy",
      label: "Solution",
      text: "We shaped Estyl as a companion that reflects confidence back to the user. The brand and interface act like a magic mirror — intelligent, expressive, and personal. We gave the AI a soul: a voice that understands, not just suggests; a presence that feels alive rather than automated. Instead of hiding behind neutrality, Estyl celebrates colors, movement, and emotion to help people see themselves in their best light.",
    },
    {
      type: "full",
      ratio: 2400 / 1600,
      cell: {
        kind: "image",
        src: "/images/estyl/socks.webp",
        alt: "Patterned socks and a phone pegged to a washing line against the sky",
      },
    },
    {
      type: "copy",
      label: "Creative Strategy",
      text: "Conducting research and interviews gave us the insight that people need someone to validate their outfit choices. Our AI assistant could take on that role. When we combined our research findings into a composite character, we came up with a person named Alice. That became the starting point for the entire brand and design concept.",
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/estyl/film-02.mp4",
          webm: "/images/estyl/film-02.webm",
          poster: "/images/estyl/film-02-poster.jpg",
          alt: "Meet Alice",
        },
      },
    },
    {
      type: "copy",
      label: "Positioning",
      text: "We are companions who give confidence and allow everyone to see themselves in the best light. We are a Magic Mirror helping our users find their best reflection.",
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/estyl/film-03.mp4",
          webm: "/images/estyl/film-03.webm",
          poster: "/images/estyl/film-03-poster.jpg",
          alt: "Positioning film",
        },
      },
    },
    {
      type: "grid",
      cells: [
        {
          ratio: 1280 / 1600,
          kind: "image",
          src: "/images/estyl/mirror-chair.webp",
          alt: "A mirror propped on an armchair in a field of flowers",
        },
        {
          ratio: 1280 / 1600,
          kind: "image",
          src: "/images/estyl/reflection-statement.webp",
          alt: "Strategic message: Let's find your best reflection",
        },
      ],
    },
    {
      type: "copy",
      label: "Tone of Voice",
      text: "Estyl's tone of voice is effortlessly cool — empathetic, witty, and relatable, never harsh or pretentious. We speak like a trusted fashion buddy who makes style feel easy and fun. Our voice blends empathy with empowerment, offering support and confidence without judgment; wit with a dash of elegance, keeping things playful yet refined; and a curated but relatable perspective that inspires self-discovery over perfection. Every word reflects our promise: Estyl. Like magic.",
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/estyl/guidelines.webp",
        alt: "Spreads from the brand guidelines covering essence, voice and identity",
      },
    },
    {
      type: "copy",
      label: "Logo",
      text: "One of our challenges was to figure out how to reshape an abstract blob, which usually symbolizes AI, into something more trustworthy and emotional. That's how we developed a logo that also serves as the brand's mascot. Like the White Rabbit from Carroll's Alice in Wonderland, our rabbit acts as a guide for our \u201cAlices,\u201d leading them into the wonderland of our app. Emerging from the mirror, it draws customers into the world of Estyl's Mirrorland.",
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/estyl/film-04.mp4",
          webm: "/images/estyl/film-04.webm",
          poster: "/images/estyl/film-04-poster.jpg",
          alt: "Logo animation",
        },
      },
    },
    {
      type: "full",
      ratio: 2304 / 1440,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/estyl/film-05.mp4",
          webm: "/images/estyl/film-05.webm",
          poster: "/images/estyl/film-05-poster.jpg",
          alt: "Rabbit mascot",
        },
      },
    },
    {
      type: "grid",
      cells: [
        {
          kind: "video",
          video: {
            mp4: "/images/estyl/ui-create-outfit.mp4",
            webm: "/images/estyl/ui-create-outfit.webm",
            poster: "/images/estyl/ui-create-outfit-poster.jpg",
            alt: "Create outfit control in the app interface",
          },
          ratio: 830 / 934,
        },
        {
          kind: "video",
          video: {
            mp4: "/images/estyl/rabbit-mark.mp4",
            webm: "/images/estyl/rabbit-mark.webm",
            poster: "/images/estyl/rabbit-mark-poster.jpg",
            alt: "The AI assistant rabbit mark",
          },
          ratio: 1400 / 1576,
        },
        {
          kind: "video",
          video: {
            mp4: "/images/estyl/eye-mark.mp4",
            webm: "/images/estyl/eye-mark.webm",
            poster: "/images/estyl/eye-mark-poster.jpg",
            alt: "The eye motif emerging from the mirror shape",
          },
          ratio: 830 / 934,
        },
      ],
    },
    {
      type: "copy",
      label: "Characters",
      text: "To make layouts more eye-catching, we created various \u00abMirrorland\u00bb creatures. These characters know how to express their unique sense of fashion and embody people who exude confidence in their appearance, no matter the situation. They may be a bit quirky, but they are also attractive and uniquely beautiful, showcasing their individuality.",
    },
    {
      type: "full",
      ratio: 1920 / 1080,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/estyl/mad-here.mp4",
          webm: "/images/estyl/mad-here.webm",
          poster: "/images/estyl/mad-here-poster.jpg",
          alt: "We're all mad here",
        },
      },
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/estyl/creatures.webp",
        alt: "The cast of Mirrorland creatures in lilac on black",
      },
    },
    {
      type: "full",
      ratio: 1920 / 1080,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/estyl/film-06.mp4",
          webm: "/images/estyl/film-06.webm",
          poster: "/images/estyl/film-06-poster.jpg",
          alt: "Web carousel",
        },
      },
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/estyl/film-07.mp4",
          webm: "/images/estyl/film-07.webm",
          poster: "/images/estyl/film-07-poster.jpg",
          alt: "Collected outfits",
        },
      },
    },
    {
      type: "grid",
      cells: [
        {
          ratio: 1280 / 1600,
          kind: "image",
          src: "/images/estyl/app-icon.webp",
          alt: "The Estyl app icon on a phone home screen",
        },
        {
          ratio: 1280 / 1600,
          kind: "image",
          src: "/images/estyl/app-icons-seasonal.webp",
          alt: "Seasonal variants of the app icon",
        },
      ],
    },
    {
      type: "full",
      ratio: 1920 / 1080,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/estyl/film-08.mp4",
          webm: "/images/estyl/film-08.webm",
          poster: "/images/estyl/film-08-poster.jpg",
          alt: "Dynamic Island interaction",
        },
      },
    },
    {
      type: "grid",
      cells: [
        {
          ratio: 1280 / 1600,
          kind: "image",
          src: "/images/estyl/instagram.webp",
          alt: "The Estyl Instagram profile",
        },
        {
          ratio: 1280 / 1600,
          kind: "image",
          src: "/images/estyl/browser.webp",
          alt: "The Estyl site in a browser",
        },
      ],
    },
    {
      type: "full",
      ratio: 2400 / 1350,
      cell: {
        kind: "image",
        src: "/images/estyl/premium.webp",
        alt: "Premium upgrade and outfit screens",
      },
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/estyl/stories.webp",
        alt: "Story cards in the brand's editorial style",
      },
    },
    {
      type: "grid",
      cells: [
        {
          ratio: 1280 / 1600,
          kind: "image",
          src: "/images/estyl/cap.webp",
          alt: "Branded cap on a draped figure",
        },
        {
          ratio: 1280 / 1600,
          kind: "image",
          src: "/images/estyl/tote.webp",
          alt: "Branded tote bag",
        },
      ],
    },
    {
      type: "full",
      ratio: 1728 / 1080,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/estyl/film-09.mp4",
          webm: "/images/estyl/film-09.webm",
          poster: "/images/estyl/film-09-poster.jpg",
          alt: "Colour system",
        },
      },
    },
    {
      type: "full",
      ratio: 1732 / 1080,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/estyl/film-10.mp4",
          webm: "/images/estyl/film-10.webm",
          poster: "/images/estyl/film-10-poster.jpg",
          alt: "Log-in flow",
        },
      },
    },
    {
      type: "full",
      ratio: 1732 / 1080,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/estyl/film-11.mp4",
          webm: "/images/estyl/film-11.webm",
          poster: "/images/estyl/film-11-poster.jpg",
          alt: "Onboarding carousel",
        },
      },
    },
    {
      type: "full",
      ratio: 1920 / 1080,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/estyl/film-12.mp4",
          webm: "/images/estyl/film-12.webm",
          poster: "/images/estyl/film-12-poster.jpg",
          alt: "Desktop experience",
        },
      },
    },
    {
      type: "grid",
      cells: [
        {
          ratio: 1280 / 1600,
          kind: "image",
          src: "/images/estyl/outfit-of-the-day.webp",
          alt: "Outfit of the Day screen",
        },
        {
          ratio: 1280 / 1600,
          kind: "image",
          src: "/images/estyl/chat.webp",
          alt: "Chat with the assistant and saved outfits",
        },
      ],
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/estyl/icon-set.webp",
        alt: "The Estyl icon set",
      },
    },
    {
      type: "full",
      ratio: 2400 / 1350,
      cell: {
        kind: "image",
        src: "/images/estyl/styled-in-seconds.webp",
        alt: "Styled in seconds — app promotion screens",
      },
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/estyl/film-13.mp4",
          webm: "/images/estyl/film-13.webm",
          poster: "/images/estyl/film-13-poster.jpg",
          alt: "Slider interaction",
        },
      },
    },
    {
      type: "grid",
      cells: [
        {
          kind: "video",
          video: {
            mp4: "/images/estyl/create-outfit.mp4",
            webm: "/images/estyl/create-outfit.webm",
            poster: "/images/estyl/create-outfit-poster.jpg",
            alt: "Building an outfit in the app",
          },
          ratio: 960 / 1200,
        },
        {
          ratio: 1280 / 1600,
          kind: "image",
          src: "/images/estyl/keyboard.webp",
          alt: "Describing a look to the assistant",
        },
      ],
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/estyl/film-14.mp4",
          webm: "/images/estyl/film-14.webm",
          poster: "/images/estyl/film-14-poster.jpg",
          alt: "Watch and phone",
        },
      },
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/estyl/daily-rewards.webp",
        alt: "Daily rewards screens",
      },
    },
    {
      type: "grid",
      cells: [
        {
          ratio: 1280 / 1600,
          kind: "image",
          src: "/images/estyl/beanie.webp",
          alt: "Branded beanie",
        },
        {
          ratio: 1280 / 1600,
          kind: "image",
          src: "/images/estyl/earring.webp",
          alt: "Rabbit earring",
        },
      ],
    },
  ],
};

const prostir: CaseStudy = {
  slug: "prostir",
  name: "Prostir",
  scope: "Strategy, Naming, Visual Identity, Website",
  talents: [{ name: "Roman Myronov", role: "Design Director" }],
  problem:
    "Prostir is a network of youth hubs in Kremenchuk, Nizhyn, and Kamianske — created to support young people in rebuilding their communities.",
  blocks: [
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/prostir/film-01.mp4",
          webm: "/images/prostir/film-01.webm",
          poster: "/images/prostir/film-01-poster.jpg",
          alt: "Prostir opening film",
        },
      },
    },
    {
      type: "copy",
      label: "Meaning",
      text: 'The word "простір" (prostir) in Ukrainian means space or room. It can refer to physical space, such as a room or a territory, but also to a more abstract concept of inner space, freedom, or a sense of openness.',
    },
    {
      type: "copy",
      label: "Project",
      text: "Prostir is a network of youth hubs in Kremenchuk, Nizhyn, and Kamianske — created to support young people in rebuilding their communities. While most youth are ready to contribute, few have access to safe, structured spaces where they can meet, learn, and act. Prostir bridges that gap. It's a place where young people solve their own challenges — and, in doing so, help solve the challenges of their communities.",
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/prostir/film-02.mp4",
          webm: "/images/prostir/film-02.webm",
          poster: "/images/prostir/film-02-poster.jpg",
          alt: "More than just space",
        },
      },
    },
    {
      type: "copy",
      label: "Challenge",
      text: "The core challenge was building an identity that could do a lot at once — scale across a growing network of hubs, work just as well on a wall as on a screen, and feel warm and human without tipping into forced cheerfulness. Most importantly, it needed to resonate with young people who have lived through war and feel authentic — while still being adaptable. Our answer was a dynamic visual system built around a modular shape and a living logo. The logo isn't static — eyes observe, expressions shift, elements rearrange — so the identity can change its mood without losing its coherence. And since we were working with a project that literally means “space,” and with a brand idea that sounds like “more than just space,” we decided to play with the space of each layout, turning it into something alive that reflects the individual challenges and problems of the people using these hubs.",
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/prostir/film-03.mp4",
          webm: "/images/prostir/film-03.webm",
          poster: "/images/prostir/film-03-poster.jpg",
          alt: "Logo animation",
        },
      },
    },
    {
      type: "full",
      ratio: 2400 / 1602,
      cell: {
        kind: "image",
        src: "/images/prostir/signage-exterior.webp",
        alt: "Hub exterior with eye and mouth signage and a Ukrainian greeting",
      },
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/prostir/film-04.mp4",
          webm: "/images/prostir/film-04.webm",
          poster: "/images/prostir/film-04-poster.jpg",
          alt: "Website preloader and hero",
        },
      },
    },
    {
      type: "full",
      ratio: 2400 / 1513,
      cell: {
        kind: "image",
        src: "/images/prostir/typography.webp",
        alt: "Five Years Later set in PP Neue Montreal",
      },
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/prostir/wayfinding.webp",
        alt: "Floor wayfinding in a stairwell",
      },
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/prostir/pictograms.webp",
        alt: "The pictogram set",
      },
    },
    {
      type: "full",
      ratio: 2400 / 1513,
      cell: {
        kind: "image",
        src: "/images/prostir/doors.webp",
        alt: "Restroom doors carrying the eye mark",
      },
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/prostir/bench.webp",
        alt: "A street bench reading Prostir for sitting",
      },
    },
    {
      type: "grid",
      cells: [
        {
          ratio: 1400 / 1750,
          kind: "image",
          src: "/images/prostir/interior.webp",
          alt: "Hub interior with a Hey, what's up? wall",
        },
        {
          ratio: 1400 / 1750,
          kind: "image",
          src: "/images/prostir/tote.webp",
          alt: "Tote bag reading Prostir for purchases",
        },
      ],
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/prostir/cap.webp",
        alt: "Branded cap on a stool",
      },
    },
    {
      type: "grid",
      cells: [
        {
          ratio: 1400 / 1750,
          kind: "image",
          src: "/images/prostir/cap-worn.webp",
          alt: "The cap worn in profile",
        },
        {
          ratio: 1400 / 1750,
          kind: "image",
          src: "/images/prostir/jacket.webp",
          alt: "Jacket with an embroidered pocket patch",
        },
      ],
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/prostir/film-05.mp4",
          webm: "/images/prostir/film-05.webm",
          poster: "/images/prostir/film-05-poster.jpg",
          alt: "Where to find us section",
        },
      },
    },
    {
      type: "full",
      ratio: 2400 / 2175,
      cell: {
        kind: "image",
        src: "/images/prostir/poster-folded.webp",
        alt: "The folded print piece",
      },
    },
    {
      type: "grid",
      cells: [
        {
          ratio: 1400 / 1755,
          kind: "image",
          src: "/images/prostir/print-flip.webp",
          alt: "Printed piece reading Flip me",
        },
        {
          ratio: 1400 / 1755,
          kind: "image",
          src: "/images/prostir/print-cities.webp",
          alt: "Printed piece listing the three hub cities",
        },
      ],
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/prostir/film-06.mp4",
          webm: "/images/prostir/film-06.webm",
          poster: "/images/prostir/film-06-poster.jpg",
          alt: "Events calendar on desktop",
        },
      },
    },
    {
      type: "grid",
      cells: [
        {
          kind: "video",
          video: {
            mp4: "/images/prostir/social-post.mp4",
            webm: "/images/prostir/social-post.webm",
            poster: "/images/prostir/social-post-poster.jpg",
            alt: "Social post announcing an event",
          },
          ratio: 960 / 1200,
        },
        {
          kind: "video",
          video: {
            mp4: "/images/prostir/digital-label.mp4",
            webm: "/images/prostir/digital-label.webm",
            poster: "/images/prostir/digital-label-poster.jpg",
            alt: "Digital Prostir label",
          },
          ratio: 1400 / 1750,
        },
      ],
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/prostir/app-calendar.webp",
        alt: "The events calendar on mobile",
      },
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/prostir/tag.webp",
        alt: "Hanging tag detail",
      },
    },
  ],
};

const specialty: CaseStudy = {
  slug: "specialty",
  name: "Specialty",
  scope: "Strategy, Verbal Identity, Visual Identity, Packaging",
  talents: [
    { name: "Roman Myronov", role: "Art Director, Designer" },
    { name: "Ann Datsiuk", role: "Designer, Illustrator" },
    { name: "Olha Shevchuk", role: "Creative Copywriter" },
    { name: "Ivan Hrankin", role: "Brand Strategist" },
    { name: "Serge Sprenne, Anastasiia Kushnarenko", role: "Motion Design" },
  ],
  problem:
    "A new coffee shop chain opening in Milan — a city whose industrial, business-oriented, fast-paced character leaves people needing somewhere to take a break.",
  blocks: [
    {
      type: "full",
      ratio: 1920 / 1080,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/specialty/film-01.mp4",
          webm: "/images/specialty/film-01.webm",
          poster: "/images/specialty/film-01-poster.jpg",
          alt: "Specialty showreel",
          sound: true,
        },
      },
    },
    {
      type: "copy",
      label: "Brief",
      text: "The client's brief was to develop a brand identity for a new coffee shop chain, with its first location in Milan. To understand the city's context, we conducted interviews with local residents to learn more about its character. The key takeaway was Milan's industrial nature, business-oriented mindset, and fast-paced lifestyle. This insight led us to a core realization – people in Milan need a place to take a break. Combined with the founders' initial vision of creating a visually aesthetic space with a high-quality customer experience, we understood that Specialty could take on the role of a retreat, offering a safe room for anyone who needs it.",
    },
    {
      type: "full",
      ratio: 1920 / 1080,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/specialty/film-02.mp4",
          webm: "/images/specialty/film-02.webm",
          poster: "/images/specialty/film-02-poster.jpg",
          alt: "Safe space",
        },
      },
    },
    {
      type: "full",
      ratio: 1921 / 1201,
      cell: {
        kind: "image",
        src: "/images/specialty/address-card.webp",
        alt: "Take a breath card with the Milan address",
      },
    },
    {
      type: "copy",
      label: "Idea",
      text: "Based on this positioning idea, we developed the concept of an “anti-stress identity.” When trying to escape intrusive thoughts, the human brain often engages in motor and sensory activities. People tend to occupy their hands—drawing, twirling a pen, molding clay, knitting, etc. Rhythmic movements help to soothe, reduce stress, and promote relaxation. They also divert the brain from anxious thoughts, fostering focus on the present moment. One of the most common habits in this context is doodling. That's why we came up with a creative mechanism: transforming stress into brand identity elements through customer doodles left on coasters and napkins. Visitors themselves become the designers of our brand.",
    },
    {
      type: "full",
      ratio: 1920 / 1080,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/specialty/film-03.mp4",
          webm: "/images/specialty/film-03.webm",
          poster: "/images/specialty/film-03-poster.jpg",
          alt: "The mechanic",
        },
      },
    },
    {
      type: "full",
      ratio: 2000 / 2000,
      cell: {
        kind: "image",
        src: "/images/specialty/doodling.webp",
        alt: "A customer doodling on a coaster at the table",
      },
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/specialty/film-04.mp4",
          webm: "/images/specialty/film-04.webm",
          poster: "/images/specialty/film-04-poster.jpg",
          alt: "Coaster cycle",
        },
      },
    },
    {
      type: "full",
      ratio: 2000 / 2000,
      cell: {
        kind: "image",
        src: "/images/specialty/table.webp",
        alt: "Coasters and cards on a table with coffee",
      },
    },
    {
      type: "copy",
      label: "Characters",
      text: "The main character of the brand is the Italian wolf, subtly referencing the brand's roots. However, the identity also incorporates a variety of other images that reflect the individuality of Specialty's visitors.",
    },
    {
      type: "full",
      ratio: 1920 / 1080,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/specialty/film-05.mp4",
          webm: "/images/specialty/film-05.webm",
          poster: "/images/specialty/film-05-poster.jpg",
          alt: "The Italian wolf and his friends",
        },
      },
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/specialty/wolf.webp",
        alt: "The wolf doodle with an awooo lockup",
      },
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/specialty/characters.webp",
        alt: "Additional doodled characters in the identity",
      },
    },
    {
      type: "full",
      ratio: 1920 / 1080,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/specialty/film-06.mp4",
          webm: "/images/specialty/film-06.webm",
          poster: "/images/specialty/film-06-poster.jpg",
          alt: "Take a breath",
        },
      },
    },
    {
      type: "full",
      ratio: 1920 / 1080,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/specialty/film-07.mp4",
          webm: "/images/specialty/film-07.webm",
          poster: "/images/specialty/film-07-poster.jpg",
          alt: "Coffee shop cup",
        },
      },
    },
    {
      type: "full",
      ratio: 2000 / 2000,
      cell: {
        kind: "image",
        src: "/images/specialty/menu-packaging.webp",
        alt: "Menu packaging for hot and cold drinks",
      },
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/specialty/menu-cards.webp",
        alt: "Menu cards carrying the doodled characters",
      },
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/specialty/film-08.mp4",
          webm: "/images/specialty/film-08.webm",
          poster: "/images/specialty/film-08-poster.jpg",
          alt: "Menu animation",
        },
      },
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/specialty/gelato.webp",
        alt: "Gelato tubs and a branded cup",
      },
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/specialty/cups.webp",
        alt: "The cup sizes, each with its own character",
      },
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/specialty/pour.webp",
        alt: "Pouring coffee, with a branded sleeve",
      },
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/specialty/bottles.webp",
        alt: "Cold brew bottles in the range",
      },
    },
    {
      type: "full",
      ratio: 2000 / 2000,
      cell: {
        kind: "image",
        src: "/images/specialty/bottle.webp",
        alt: "A cold brew bottle on red",
      },
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/specialty/film-09.mp4",
          webm: "/images/specialty/film-09.webm",
          poster: "/images/specialty/film-09-poster.jpg",
          alt: "Social stories",
        },
      },
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/specialty/social.webp",
        alt: "Social posts in the brand's voice",
      },
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/specialty/guidelines.webp",
        alt: "Spreads from the brand guidelines",
      },
    },
  ],
};

const genie: CaseStudy = {
  slug: "genie",
  name: "Genie",
  scope: "Brand Identity, Product Design, Motion",
  talents: [
    { name: "Sam Tipikin", role: "Design Director, Product" },
    { name: "Roman Myronov", role: "Creative Director" },
    { name: "Roman Danyliuk", role: "Motion Designer" },
    { name: "Yuliia Lunina", role: "UI/UX Designer" },
  ],
  problem:
    "Genie had a product that worked and a brand that was still missing a piece — an app that made sense of scattered health data, in an experience that was purely functional.",
  blocks: [
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/genie/wordmark.webp",
        alt: "The genie wordmark over a brand gradient",
      },
    },
    {
      type: "copy",
      label: "Problem",
      text: "Genie had a product that worked and a brand that was still missing a piece. The app pulled scattered health data into one place and made sense of it, but the experience was purely functional — healthcare blue and green, a generic AI sphere, screens that delivered information without ever suggesting who was delivering it. The identity had no character yet, and the parts weren't connected: logo, symbol and motion existed separately rather than as a system. In a category people already avoid, that piece matters more than it would anywhere else. How Genie makes someone feel decides whether they open it at all — and that was the layer still to come. Here is how it used to look.",
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/genie/before.webp",
        alt: "The previous Genie brand and app screens",
      },
    },
    {
      type: "copy",
      label: "Logo",
      text: "Most marks in health tech look interchangeable, and the old Genie wordmark sat in the middle of that pack. Healthcare also limits how far a brand can move. People trust a health product with their bodies, so the mark had to stay trustworthy. We kept that weight and looked for one detail that would make it recognisable. The name gave us that detail. A genie is a jinn, and a jinn trails off into smoke. We drew that smoke into the descender of the g, so a single letter carries the story of the name. That order fits a brand whose magic works in the background.",
    },
    {
      type: "copy",
      label: "Sub-brands",
      text: "Genie won't stay one product. Rather than hand over a single lockup, we built a derivation framework: a fixed lockup structure and rules for how colour carries across variants, so any sub-brand reads as part of the same family without being redrawn. The team can add products and stay aligned with the master brand without coming back to us.",
    },
    {
      type: "grid",
      cells: [
        {
          kind: "video",
          video: {
            mp4: "/images/genie/wordmark-build.mp4",
            webm: "/images/genie/wordmark-build.webm",
            poster: "/images/genie/wordmark-build-poster.jpg",
            alt: "The wordmark building up",
          },
          ratio: 800 / 1000,
        },
        {
          kind: "video",
          video: {
            mp4: "/images/genie/g-anatomy.mp4",
            webm: "/images/genie/g-anatomy.webm",
            poster: "/images/genie/g-anatomy-poster.jpg",
            alt: "The g descender set against anatomy",
          },
          ratio: 1280 / 1600,
        },
      ],
    },
    {
      type: "grid",
      cells: [
        {
          ratio: 1280 / 1600,
          kind: "image",
          src: "/images/genie/logo-construction.webp",
          alt: "Construction of the g letterform",
        },
        {
          ratio: 1280 / 1600,
          kind: "image",
          src: "/images/genie/app-icon.webp",
          alt: "The app icon on a phone home screen",
        },
      ],
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/genie/film-01.mp4",
          webm: "/images/genie/film-01.webm",
          poster: "/images/genie/film-01-poster.jpg",
          alt: "Sub-brand lockup animation",
        },
      },
    },
    {
      type: "copy",
      label: "Colour & Type",
      text: "Genie came to us with a palette, a set of gradients and a serif typeface already in use across their app. They wanted all three kept. Our research raised the problem with that: nearly every healthcare brand runs on blue and green, and Genie's palette sat right among them. So the brief turned into a question of approach. We couldn't swap the assets, so we had to change how the brand used them. The work that follows shows how we took the client's own colours, gradients and type and built something that stands apart from the category.",
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/genie/film-02.mp4",
          webm: "/images/genie/film-02.webm",
          poster: "/images/genie/film-02-poster.jpg",
          alt: "The colour system",
        },
      },
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/genie/film-03.mp4",
          webm: "/images/genie/film-03.webm",
          poster: "/images/genie/film-03-poster.jpg",
          alt: "The typeface",
        },
      },
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/genie/film-04.mp4",
          webm: "/images/genie/film-04.webm",
          poster: "/images/genie/film-04-poster.jpg",
          alt: "Typography and cards",
        },
      },
    },
    {
      type: "copy",
      label: "Strategy",
      text: "Genie gives each user personalised insights and guidance about their own health. Most health apps present the same information to everyone. We repositioned Genie as a spotlight: it shows what matters for you right now and leaves the rest in the dark until you need it.",
    },
    {
      type: "copy",
      label: "The Lamp",
      text: "A genie lives in a lamp, and a lamp throws light on one spot. That became the brand's visual metaphor. We based the lamp silhouettes on biological and organic forms, so they sit naturally next to anatomy, body imagery and the client's gradients.",
    },
    {
      type: "copy",
      label: "Shape Generator",
      text: "The brand has to keep working after we hand it over. Genie's marketing and product teams will produce new material for years, so we built them a tool that generates brand visuals. It creates lamp shapes and gradient compositions within the system's rules, and the team can make new assets without redrawing anything or coming back to us.",
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/genie/film-05.mp4",
          webm: "/images/genie/film-05.webm",
          poster: "/images/genie/film-05-poster.jpg",
          alt: "The lamp silhouettes explained",
        },
      },
    },
    {
      type: "grid",
      cells: [
        {
          ratio: 1280 / 1600,
          kind: "image",
          src: "/images/genie/subbrand-cards.webp",
          alt: "Sub-brand cards across the gradient range",
        },
        {
          kind: "video",
          video: {
            mp4: "/images/genie/lamp-shape.mp4",
            webm: "/images/genie/lamp-shape.webm",
            poster: "/images/genie/lamp-shape-poster.jpg",
            alt: "A lamp shape in motion",
          },
          ratio: 1280 / 1600,
        },
      ],
    },
    {
      type: "full",
      ratio: 1920 / 1030,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/genie/film-06.mp4",
          webm: "/images/genie/film-06.webm",
          poster: "/images/genie/film-06-poster.jpg",
          alt: "The shape generator in use",
        },
      },
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/genie/film-07.mp4",
          webm: "/images/genie/film-07.webm",
          poster: "/images/genie/film-07-poster.jpg",
          alt: "Cards and phone",
        },
      },
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/genie/film-08.mp4",
          webm: "/images/genie/film-08.webm",
          poster: "/images/genie/film-08-poster.jpg",
          alt: "Onboarding flow",
        },
      },
    },
    {
      type: "full",
      ratio: 1920 / 1920,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/genie/film-09.mp4",
          webm: "/images/genie/film-09.webm",
          poster: "/images/genie/film-09-poster.jpg",
          alt: "Lock screen",
        },
      },
    },
    {
      type: "copy",
      label: "Beyond the Lamp",
      text: "The lamp introduced the idea. The gradient approach behind it goes much further. The same technique can take the form of whatever the context calls for, from an organ to a metric to a person in motion, and still read as Genie. The brand gets one visual language that adapts to the subject instead of a fixed set of symbols.",
    },
    {
      type: "copy",
      label: "The App",
      text: "The app is the brand's main home. Here the gradients do real work: each one shapes itself around the data it shows, so the interface carries the same spotlight idea as the rest of the brand.",
    },
    {
      type: "full",
      ratio: 1920 / 1536,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/genie/film-10.mp4",
          webm: "/images/genie/film-10.webm",
          poster: "/images/genie/film-10-poster.jpg",
          alt: "The gradient language across subjects",
        },
      },
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/genie/film-11.mp4",
          webm: "/images/genie/film-11.webm",
          poster: "/images/genie/film-11-poster.jpg",
          alt: "App screens",
        },
      },
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/genie/watch.webp",
        alt: "The brand on a smartwatch",
      },
    },
    {
      type: "copy",
      label: "Character",
      text: "Genie's assistant started as an abstract sphere, the same glowing blob most AI products use. It had no link to health or to the name. We rebuilt it around fire. Fire already carries the meanings a health guide needs. People talk about fire in someone's eyes when they mean energy, and a fire in the soul when they mean strength. Fire is the warmth of a living body. Healers used it as the first antiseptic, and stage magicians still use it to hold an audience. It also closes the loop with the name: in folklore, jinns are made of smokeless fire. The flame gives the character a face and a range of moods. It nudges, reassures, rests and thinks, and each state changes its colour and shape using the same gradients as the rest of the brand. In the app, users interact with Genie directly, and it responds with the brand's motion and colour. We wanted that experience to feel pleasant without costing readability, so type, contrast and hierarchy follow the standards a healthcare product needs. The character went through the same check. The gradient flame loses its detail at small sizes, so we drew a simplified mini Genie: a flat shape with the same face that stays readable when small and holds strong contrast on any surface.",
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/genie/film-12.mp4",
          webm: "/images/genie/film-12.webm",
          poster: "/images/genie/film-12-poster.jpg",
          alt: "The character's states",
        },
      },
    },
    {
      type: "full",
      ratio: 1920 / 1536,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/genie/film-13.mp4",
          webm: "/images/genie/film-13.webm",
          poster: "/images/genie/film-13-poster.jpg",
          alt: "The character in the product",
        },
      },
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/genie/chat.webp",
        alt: "Chat with the assistant",
      },
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/genie/film-14.mp4",
          webm: "/images/genie/film-14.webm",
          poster: "/images/genie/film-14-poster.jpg",
          alt: "Chat flow",
        },
      },
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/genie/film-15.mp4",
          webm: "/images/genie/film-15.webm",
          poster: "/images/genie/film-15-poster.jpg",
          alt: "Social media",
        },
      },
    },
    {
      type: "full",
      ratio: 2400 / 1600,
      cell: {
        kind: "image",
        src: "/images/genie/keynote.webp",
        alt: "The brand on stage",
      },
    },
  ],
};

const volta: CaseStudy = {
  slug: "volta",
  name: "Volta",
  scope: "Strategy, Visual Identity, Communication",
  talents: [{ name: "Roman Myronov", role: "Design Director" }],
  problem:
    "Volta Buro is a real estate marketing buro with a mission to power up real estate — charging developers' businesses with brands, integrated marketing and customised technology.",
  blocks: [
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/volta/film-01.mp4",
          webm: "/images/volta/film-01.webm",
          poster: "/images/volta/film-01-poster.jpg",
          alt: "The Volta mark sparking to life",
        },
      },
    },
    {
      type: "copy",
      label: "Buro",
      text: "Volta Buro is a Real Estate marketing buro with a mission to Power-up real estate. They power up developers' businesses using a system of specialized real estate marketing and charge their clients' business with powerful brands, integrated marketing & sales solutions and customized technologies.",
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "image",
        src: "/images/volta/logo.webp",
        alt: "The Volta Buro logo lockup",
      },
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "image",
        src: "/images/volta/mark.webp",
        alt: "The mark built from a house silhouette and an R",
      },
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "image",
        src: "/images/volta/typeface.webp",
        alt: "PP Neue Montreal specimen in the brand orange",
      },
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/volta/tote.webp",
        alt: "A We Power Up Real Estate tote in an industrial doorway",
      },
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/volta/film-02.mp4",
          webm: "/images/volta/film-02.webm",
          poster: "/images/volta/film-02-poster.jpg",
          alt: "The Volta wordmark animating",
        },
      },
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/volta/film-03.mp4",
          webm: "/images/volta/film-03.webm",
          poster: "/images/volta/film-03-poster.jpg",
          alt: "The Real System presentation",
        },
      },
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/volta/cards.webp",
        alt: "Business cards in black and orange",
      },
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "image",
        src: "/images/volta/portfolio.webp",
        alt: "Developer project work across the buro's portfolio",
      },
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/volta/film-04.mp4",
          webm: "/images/volta/film-04.webm",
          poster: "/images/volta/film-04-poster.jpg",
          alt: "What we do",
        },
      },
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "image",
        src: "/images/volta/character.webp",
        alt: "The brand character and a recruitment poster",
      },
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "image",
        src: "/images/volta/social.webp",
        alt: "Social posts on a city backdrop",
      },
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "image",
        src: "/images/volta/objects.webp",
        alt: "The brand's dimensional objects and how they relate",
      },
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "image",
        src: "/images/volta/presentation.webp",
        alt: "Presentation material for real estate developers",
      },
    },
    {
      type: "full",
      ratio: 1600 / 2400,
      cell: {
        kind: "image",
        src: "/images/volta/cap.webp",
        alt: "A branded cap on folded clothing",
      },
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/volta/icons.webp",
        alt: "The icon set",
      },
    },
    {
      type: "full",
      ratio: 2400 / 1500,
      cell: {
        kind: "image",
        src: "/images/volta/apparel.webp",
        alt: "Branded apparel",
      },
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "video",
        video: {
          mp4: "/images/volta/film-05.mp4",
          webm: "/images/volta/film-05.webm",
          poster: "/images/volta/film-05-poster.jpg",
          alt: "The site on a laptop",
        },
      },
    },
    {
      type: "full",
      ratio: 1920 / 1200,
      cell: {
        kind: "image",
        src: "/images/volta/website.webp",
        alt: "Website screens for the buro",
      },
    },
  ],
};

const studies: Record<string, CaseStudy> = {
  luminar,
  estyl,
  prostir,
  specialty,
  genie,
  volta,
};

export function getCase(slug: string): CaseStudy | undefined {
  return studies[slug];
}

export type CaseMeta = { slug: string; name: string; done: boolean; cover?: string };

// Single source of truth for case order and completion status — shared by
// the home menu and the previous/next navigation on case pages. `cover` is
// the still shown in the home menu's hover preview (see components/home.tsx);
// cases without one yet just don't show a preview when hovered.
export const caseOrder: CaseMeta[] = [
  { slug: "luminar", name: "Luminar", done: true, cover: "/images/luminar/block-1.webp" },
  { slug: "denormalized", name: "Denormalized", done: false },
  { slug: "specialty", name: "Specialty", done: true, cover: "/images/specialty/wolf.webp" },
  { slug: "prostir", name: "Prostir", done: true, cover: "/images/prostir/signage-exterior.webp" },
  { slug: "estyl", name: "Estyl", done: true, cover: "/images/estyl/socks.webp" },
  { slug: "volta", name: "Volta", done: true, cover: "/images/volta/mark.webp" },
  { slug: "grail", name: "Grail", done: false },
  { slug: "townie", name: "Townie", done: false },
  { slug: "genie", name: "Genie", done: true, cover: "/images/genie/wordmark.webp" },
];

export function getCaseMeta(slug: string): CaseMeta {
  const found = caseOrder.find((c) => c.slug === slug);
  if (found) return found;
  const name = slug.charAt(0).toUpperCase() + slug.slice(1);
  return { slug, name, done: false };
}

/** Previous/Next only ever land on finished cases — placeholders aren't
 * valid destinations, so both directions skip past them, wrapping around
 * the full order. */
export function getAdjacentCases(slug: string): {
  previous: CaseMeta;
  next: CaseMeta;
} {
  const index = caseOrder.findIndex((c) => c.slug === slug);
  const done = caseOrder.map((c, i) => ({ ...c, i })).filter((c) => c.done);

  const previous =
    [...done].reverse().find((c) => c.i < index) ?? done[done.length - 1];
  const next = done.find((c) => c.i > index) ?? done[0];

  return { previous, next };
}

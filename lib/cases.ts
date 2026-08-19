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

const studies: Record<string, CaseStudy> = {
  luminar,
  estyl,
  prostir,
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
  { slug: "specialty", name: "Specialty", done: false },
  { slug: "prostir", name: "Prostir", done: true, cover: "/images/prostir/signage-exterior.webp" },
  { slug: "estyl", name: "Estyl", done: true, cover: "/images/estyl/socks.webp" },
  { slug: "volta", name: "Volta", done: false },
  { slug: "grail", name: "Grail", done: false },
  { slug: "townie", name: "Townie", done: false },
  { slug: "genie", name: "Genie", done: false },
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

import { Link } from 'react-router-dom';

const ownerRequired = '[OWNER CONFIRMATION REQUIRED]';

const pages = {
  about: {
    title: 'About Articraft',
    intro: 'Articraft provides a marketplace interface for customers to explore products from artists, add items to a cart, place orders, and submit eligible reviews. Artist accounts can create and manage product listings and seller orders.',
    sections: [['Marketplace features', ['Customer, artist, and administrator account roles are supported.', 'Product listings, carts, wishlists, orders, payments through Razorpay, artist dashboards, and reviews are available in the current application.']], ['Business details', [`Legal business/entity name: ${ownerRequired}`, `Business registration and tax details: ${ownerRequired}`]]],
  },
  contact: {
    title: 'Contact',
    intro: 'Official contact details have not been provided in the project configuration.',
    sections: [['Business contact details', [`Business email: ${ownerRequired}`, `Business address: ${ownerRequired}`, `Phone: ${ownerRequired}`, `Privacy or grievance contact: ${ownerRequired}`]]],
  },
  privacy: {
    title: 'Privacy Policy',
    intro: 'This page describes the data handling implemented in the current Articraft application. It should be reviewed and completed by the owner before publication. Articraft is intended to handle personal data in accordance with applicable law; certain privacy controls and operational details require owner configuration and legal review.',
    sections: [
      ['Information collected and purpose', ['Account information: name, email address, and password are collected for registration, sign-in, account access, and account security. Passwords are stored as password hashes rather than returned by the API.', 'Delivery information: recipient name, street address, city, and country are collected during checkout to record delivery details for an order.', 'Artist profile information: artist accounts may provide a bio, location, specialization, and optional social links for their public artist profile.', 'Order and payment information: the application stores item/order details, totals, delivery information, payment status, and Razorpay order/payment identifiers to process and manage orders.', 'Reviews: eligible customers can submit a rating and comment. The reviewer name and avatar may be displayed with a review.', 'Artist product images: uploaded product image files are used in product listings and stored through the image service described below.']],
      ['Browser storage', ['The application uses browser localStorage for the authentication/session token and stored user data, anonymous cart items, anonymous wishlist items, and theme preference.', 'localStorage is browser storage. It is not automatically a cookie.', 'The current code audit found no application code that creates cookies, uses sessionStorage, IndexedDB, service workers, analytics, advertising pixels, session replay, or fingerprinting.']],
      ['Service providers and infrastructure', ['Razorpay processes checkout payments. The checkout integration receives the customer name and account email as prefill data, alongside payment information handled in the Razorpay payment window.', 'Cloudinary stores artist-uploaded product images.', 'MongoDB is used by the application server for account, catalog, cart, wishlist, order, and review records.', 'Unsplash image URLs are used for current static/demo imagery. A browser request for these resources may be sent to Unsplash. OWNER REVIEW REQUIRED — verify image rights and whether these resources should remain in production.']],
      ['Security and access', ['The application uses password hashing, JWT authentication, role-based access control, request validation, rate limiting, Helmet headers, and payment signature verification. These measures do not remove the need for operational security review.', 'Technical request/error logging is enabled on the server. Exact log access, retention, and deletion practices are not defined in the repository.']],
      ['Your requests and children', [`There is no implemented self-service workflow for account-data export, correction, or deletion. Request handling process: ${ownerRequired}.`, `The application does not implement age verification or a dedicated children’s-data flow. Business/legal approach for children’s data: ${ownerRequired}.`, `Retention periods for account, order, review, log, and image data: ${ownerRequired}.`]],
      ['Contact', [`Privacy/grievance contact: ${ownerRequired}`]],
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    intro: 'These terms describe the features currently available in Articraft and must be completed with owner-approved business terms before publication.',
    sections: [
      ['Accounts and access', ['Customers and artists can register accounts. Account access uses application authentication and may be restricted when an account is inactive.', `Account eligibility, account responsibilities, and suspension/termination rules: ${ownerRequired}.`]],
      ['Listings, orders, and payments', ['Artist accounts can create and manage product listings. Customers can place items in a cart and submit checkout details.', 'Payments are initiated through Razorpay. Order payment status and seller delivery status are recorded by the application.', `Seller obligations, product-listing rules, pricing, taxes, and marketplace fees: ${ownerRequired}.`]],
      ['Delivery, reviews, and content', ['Delivery details are collected at checkout. The application records seller order status updates.', 'Review submission is limited by the current application to paid, delivered items and one review per customer/product.', 'Artists remain responsible for the content and images they upload and must have rights to use that content.', `Shipping, delivery, returns, and review-moderation rules: ${ownerRequired}.`]],
      ['Prohibited use and availability', [`Prohibited misuse rules: ${ownerRequired}.`, `Service availability, limitation of liability, dispute handling, governing law, and changes to these terms: ${ownerRequired}.`]],
      ['Contact', [`Business/legal contact: ${ownerRequired}`]],
    ],
  },
  cookies: {
    title: 'Cookie Policy',
    intro: 'This policy reflects the current code audit and should be reviewed by the owner before publication.',
    sections: [
      ['Cookies and tracking', ['The current application code does not create cookies and does not include non-essential analytics, advertising pixels, session replay, or fingerprinting.', 'No cookie-consent banner is implemented because the current application does not implement those non-essential tracking technologies. Owner/legal review is required if cookies or tracking are added later.']],
      ['Browser localStorage', ['Articraft uses localStorage for authentication/session state, anonymous cart items, anonymous wishlist items, and a theme preference.', 'localStorage is browser storage and is not automatically a cookie. Users can manage localStorage through their browser settings; removing it can sign a user out or remove anonymous cart/wishlist/theme data.']],
      ['External resources', ['Razorpay loads its payment checkout script when checkout is opened. Unsplash-hosted static/demo images may cause browser requests to Unsplash. Owner review is required before production use.']],
    ],
  },
  refunds: {
    title: 'Refund & Cancellation Policy',
    intro: 'The current application records orders and payment status, but does not implement refund, return, exchange, or customer cancellation workflows. The following items must be defined by the owner before publication.',
    sections: [['Refund eligibility', [`Eligible circumstances and time period: ${ownerRequired}`]], ['Cancellation', [`Cancellation window and process: ${ownerRequired}`]], ['Damaged or incorrect items', [`Damage/incorrect-item reporting process and evidence requirements: ${ownerRequired}`]], ['Returns and exchanges', [`Return period, exchange rules, and return-shipping responsibility: ${ownerRequired}`]], ['Refund processing', [`Refund method and processing timeline: ${ownerRequired}`]]],
  },
  shipping: {
    title: 'Shipping & Delivery',
    intro: 'The checkout code currently calculates a shipping fee of ₹12 below a ₹120 cart subtotal and zero above that threshold. This is a technical checkout calculation, not a complete shipping promise or delivery policy.',
    sections: [['Delivery terms', [`Delivery locations, service areas, carriers, dispatch times, and delivery estimates: ${ownerRequired}`]], ['Shipping charges', [`Official shipping charges and any free-delivery conditions: ${ownerRequired}`]], ['Order tracking and delivery issues', [`Tracking availability, failed-delivery process, and support contact: ${ownerRequired}`]]],
  },
};

function PolicySection({ heading, items }) {
  return <section className="mt-10"><h2 className="text-2xl font-semibold text-slate-800">{heading}</h2><ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-slate-600">{items.map((item) => <li key={item}>{item}</li>)}</ul></section>;
}

export default function InfoPage({ page }) {
  const item = pages[page] || pages.about;
  return <div className="section-shell py-12 sm:py-16"><article className="mx-auto max-w-3xl rounded-[2rem] border border-stone-200 bg-white p-6 shadow-soft sm:p-10"><h1 className="font-display text-4xl text-forest sm:text-5xl">{item.title}</h1><p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">{item.intro}</p>{item.sections.map(([heading, items]) => <PolicySection key={heading} heading={heading} items={items} />)}<p className="mt-10 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">This page describes the current implementation and contains items requiring owner confirmation. It is not a claim of legal compliance or legal advice.</p>{page !== 'privacy' && <p className="mt-6 text-sm text-slate-600">For current application data handling, see the <Link className="text-forest underline" to="/privacy">Privacy Policy</Link> and <Link className="text-forest underline" to="/cookies">Cookie Policy</Link>.</p>}</article></div>;
}

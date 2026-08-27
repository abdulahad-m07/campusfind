# CampusFind — Product Requirements Document

## 1. Product Overview

CampusFind is a simple web-based lost-and-found platform for college campuses.

The goal is straightforward:

> A student loses or finds something → they post it → another student finds the post → they contact each other → the item is returned.

The product should feel like a **simple digital campus notice board**, not a complicated social network or SaaS dashboard.

## 2. MVP Goal

Build a working website where anyone can:

1. Browse lost/found items.
2. Search for an item.
3. Open an item's details.
4. Report a lost or found item.
5. Provide contact information so another student can reach them.

No account is required.

## 3. Core Principles

- Simple as possible.
- No unnecessary features.
- No login/signup.
- No user profiles.
- No complicated dashboards.
- No chat system.
- No unnecessary animations.
- Very few buttons.
- Mobile-friendly.
- Fast and easy to understand.

If a feature does not directly help someone **find, report, or recover an item**, it should not be part of the MVP.

## 4. Users

### Student who lost an item

They should be able to:
- Browse found items.
- Search for their item.
- Open an item.
- Contact the person who found it.

### Student who found an item

They should be able to:
- Report the found item.
- Add useful details.
- Add a photo.
- Provide contact information.

### Student who wants to report a lost item

They should be able to:
- Report the lost item.
- Add useful details.
- Add a photo.
- Provide contact information.

## 5. Pages

### Home

Purpose: Give users an immediate way to search and discover items.

Contains:
- CampusFind branding.
- Search bar.
- Recent lost/found items.
- Clear `Report Item` action.

### Browse

Purpose: View available lost/found posts.

Contains:
- Item cards/list.
- Search.
- Minimal filtering if needed.
- Lost/Found distinction.

### Report Item

Purpose: Create a new lost/found post.

Fields:
- Type: Lost / Found
- Item name
- Description
- Location
- Date
- Photo
- Contact information

The form should remain short and easy to complete.

### Item Details

Purpose: Show enough information to identify the item and make contact.

Contains:
- Photo
- Item name
- Lost/Found status
- Description
- Location
- Date
- Contact action/information

## 6. Functional Requirements

### FR-01: Browse Items
The website must retrieve and display existing lost/found posts.

### FR-02: Search
Users must be able to search posts using simple text such as item name or description.

### FR-03: Report Item
Users must be able to submit a lost/found item.

### FR-04: Image Upload
Users should be able to attach an image to a post.

### FR-05: Item Details
Each post must have a dedicated details view/page.

### FR-06: Contact
The post must contain contact information supplied by the person creating it.

### FR-07: Status
A post should have a basic status such as:
- Active
- Returned

The MVP can initially support only the active state and add returned handling after the core flow works.

## 7. Data Required for an Item

```text
id
type              // lost | found
itemName
description
location
date
imageUrl
contact
status            // active | returned
createdAt
```

## 8. Explicitly Out of Scope

Do NOT build these for the MVP:

- Login/signup
- Passwords
- User accounts
- Profiles
- My Posts
- Real-time chat
- Notifications
- AI matching
- Recommendation system
- Gamification
- Ratings
- Social feed
- Complex admin dashboard
- Analytics dashboard
- Payments
- Multiple campuses
- Native mobile app

## 9. Success Criteria

The MVP is successful when a student can complete this flow:

```text
Open CampusFind
      ↓
Search/Browse
      ↓
Find an item
      ↓
Open item details
      ↓
Contact the poster
```

And:

```text
Open CampusFind
      ↓
Report Item
      ↓
Fill short form
      ↓
Submit
      ↓
Item appears in Browse
```

The website should be understandable without instructions.

## 10. Future Features

Only after the MVP works reliably:

- Better search/filtering
- Mark item as returned
- Basic moderation/admin tools
- Optional login
- AI-assisted matching
- Notifications
- Multiple campus support

These are future possibilities, not MVP requirements.

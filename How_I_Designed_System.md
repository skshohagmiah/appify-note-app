# HOW I designed this appify note app

I designed this app with the following features:

### 1. Multi Tenancy:
where we assume that which company is a tenant and each company has its own workspaces.

this is the schema look like for company:

```prisma
model Company {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users      User[]
  workspaces Workspace[]

  @@map("companies")
}
```

SO under a company we have multiple users and workspaces.

**Now how to we handle data isolation between the tenants (companies)?**

- we could do data isolation because all the users and workspaces are associated with the company id (tenant id).
- so that we can use the company id to filter the data for each tenant.
- because of this there is no change of data leakage between the tenants.

Only the users under a company can see the notes created by the users under the same company. This is possible becuase users are associated with the company id (tenant id).


### 2. Performance Optimization:
I have seperated big features into seperate tables/models. And i used indexing to optimize the read performance and also did use redis for short term caching. like the note schema here:

```prisma
// Note model - core content entity
model Note {
  id          String     @id @default(cuid())
  title       String
  content     String     @db.Text
  workspaceId String
  createdBy   String
  status      NoteStatus @default(DRAFT)
  type        NoteType   @default(PRIVATE)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  workspace Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  user      User          @relation(fields: [createdBy], references: [id], onDelete: Cascade)
  tags      NoteTag[]
  votes     Vote[]
  histories NoteHistory[]

  // Denormalized counts for scalable sorting
  upvotes   Int @default(0)
  downvotes Int @default(0)

  @@index([workspaceId])
  @@index([createdBy])
  @@index([status])
  @@index([type])
  @@index([createdAt])
  @@index([title])
  @@index([upvotes])
  @@index([downvotes])
  @@map("notes")
}
```

I Have queried data using indexes to optimize the read performance. like query data by status, title, upvotes, downvotes etc.


### 3. History Tracking and Rollback:
I have created a new table for history management. This table stores the previous versions of notes. This is useful for rollback and version tracking. this is the schema of the history table:

```prisma
// Note history for version tracking
model NoteHistory {
  id              String   @id @default(cuid())
  noteId          String
  previousTitle   String
  previousContent String   @db.Text
  updatedBy       String
  createdAt       DateTime @default(now())

  note Note @relation(fields: [noteId], references: [id], onDelete: Cascade)
  user User @relation(fields: [updatedBy], references: [id], onDelete: Cascade)

  @@index([noteId])
  @@index([createdAt])
  @@map("note_histories")
}
```

Now if the user want to rollback to previous version of the note, we can use the history table to get the previous version of the note.

And these histories are automatically created when the note is updated. And deleted after 7 days with a cron job that run at night 2 am.


### 4. Data Isolation:
As i think some big companies probably use seperate database for each tenant. but as this is the basic and small scale application, I did data isolation logically in a single database. This would work most of the time as all the queries should use the tenant id (company id) to filter the data. So there is not data leakage between the tenants if programmer do not write wrong queries.


### 5. Security Handling:
I have used JWT for authentication. And i have used middleware to check if the user is authenticated or not. Beside those I used Cors to allow only specific domains to access the api. And i also used rate limiting to prevent abuse.



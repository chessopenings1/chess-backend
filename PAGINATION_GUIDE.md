# Pagination Guide - Puzzles API

## Overview

The Puzzles API now includes pagination to handle large datasets efficiently. Both the "Get All Puzzles" and "Update Themes" endpoints process 1000 puzzles at a time to prevent memory overload.

## Paginated Endpoints

### 1. Get All Puzzles (Paginated)

**GET** `/puzzles?page={pageNumber}`

Returns 1000 puzzles per page.

#### Parameters:
- `page` (optional) - Page number (default: 1)

#### Example Requests:

```bash
# Get first page (puzzles 1-1000)
GET /puzzles
GET /puzzles?page=1

# Get second page (puzzles 1001-2000)
GET /puzzles?page=2

# Get third page (puzzles 2001-3000)
GET /puzzles?page=3
```

#### Response Format:

```json
{
  "success": true,
  "data": [ /* array of 1000 puzzles */ ],
  "pagination": {
    "page": 1,
    "limit": 1000,
    "total": 8585,
    "totalPages": 9,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "user": {
    "id": "64f5a1b2c3d4e5f6a7b8c9d0"
  }
}
```

#### Pagination Fields:

- `page` - Current page number
- `limit` - Number of items per page (always 1000)
- `total` - Total number of puzzles in database
- `totalPages` - Total number of pages
- `hasNextPage` - `true` if there are more pages after this one
- `hasPrevPage` - `true` if there are pages before this one

---

### 2. Update All Themes (Paginated)

**GET** `/puzzles/foo?page={pageNumber}`

Updates Themes for 1000 puzzles at a time.

#### Parameters:
- `page` (optional) - Page number (default: 1)

#### Example Requests:

```bash
# Update first 1000 puzzles
GET /puzzles/foo
GET /puzzles/foo?page=1

# Update second batch (puzzles 1001-2000)
GET /puzzles/foo?page=2

# Update third batch (puzzles 2001-3000)
GET /puzzles/foo?page=3
```

#### Response Format:

```json
{
  "success": true,
  "data": {
    "updated": 856,
    "message": "Successfully updated 856 puzzles on page 1. More pages available.",
    "page": 1,
    "hasMore": true
  },
  "user": {
    "id": "64f5a1b2c3d4e5f6a7b8c9d0"
  }
}
```

#### Response Fields:

- `updated` - Number of puzzles actually updated on this page
- `message` - Status message with progress info
- `page` - Current page number
- `hasMore` - `true` if there are more pages to process

---

## Complete Update Workflow

To update all puzzles in the database, call the `/foo` endpoint for each page:

### Manual Approach:

```bash
# Update page 1
curl -X GET "http://localhost:3001/puzzles/foo?page=1" \
  -H "Authorization: Bearer <token>"

# Update page 2
curl -X GET "http://localhost:3001/puzzles/foo?page=2" \
  -H "Authorization: Bearer <token>"

# Continue until hasMore is false
```

### Automated Script (JavaScript):

```javascript
const axios = require('axios');

const token = 'your-jwt-token';
const baseUrl = 'http://localhost:3001';

async function updateAllPuzzles() {
  let page = 1;
  let hasMore = true;
  let totalUpdated = 0;

  while (hasMore) {
    console.log(`Processing page ${page}...`);
    
    const response = await axios.get(`${baseUrl}/puzzles/foo?page=${page}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const { updated, hasMore: more } = response.data.data;
    totalUpdated += updated;
    hasMore = more;
    
    console.log(`Page ${page}: Updated ${updated} puzzles`);
    
    if (hasMore) {
      page++;
      // Optional: Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`✅ Complete! Total puzzles updated: ${totalUpdated}`);
}

updateAllPuzzles().catch(console.error);
```

### Automated Script (cURL + Bash):

```bash
#!/bin/bash

TOKEN="your-jwt-token"
BASE_URL="http://localhost:3001"
PAGE=1
HAS_MORE=true

while [ "$HAS_MORE" = "true" ]; do
  echo "Processing page $PAGE..."
  
  RESPONSE=$(curl -s -X GET "$BASE_URL/puzzles/foo?page=$PAGE" \
    -H "Authorization: Bearer $TOKEN")
  
  UPDATED=$(echo $RESPONSE | jq -r '.data.updated')
  HAS_MORE=$(echo $RESPONSE | jq -r '.data.hasMore')
  
  echo "Page $PAGE: Updated $UPDATED puzzles"
  
  if [ "$HAS_MORE" = "true" ]; then
    PAGE=$((PAGE + 1))
    sleep 0.1  # Optional: 100ms delay between requests
  fi
done

echo "✅ All puzzles updated!"
```

---

## Benefits of Pagination

### Memory Efficiency
- ✅ **Controlled Memory Usage** - Only loads 1000 puzzles at a time
- ✅ **Prevents Crashes** - Avoids out-of-memory errors
- ✅ **Faster Response Times** - Smaller data chunks process quickly

### Flexibility
- ✅ **Resume Processing** - Can stop and resume at any page
- ✅ **Parallel Processing** - Can process multiple pages in parallel (advanced)
- ✅ **Progress Tracking** - Know exactly how much is done

### Scalability
- ✅ **Works with any dataset size** - 1K, 10K, 100K+ puzzles
- ✅ **Predictable Performance** - Consistent response times

---

## Example Usage Scenarios

### Scenario 1: Browse Puzzles
```bash
# View first 1000 puzzles
GET /puzzles?page=1

# View next 1000 puzzles
GET /puzzles?page=2
```

### Scenario 2: Update All Themes in Batches
```bash
# Process first batch
GET /puzzles/foo?page=1
# Response: { "hasMore": true, "updated": 856 }

# Process second batch
GET /puzzles/foo?page=2
# Response: { "hasMore": true, "updated": 923 }

# Continue until hasMore is false
```

### Scenario 3: Frontend Pagination
```javascript
// React/Vue example
const [currentPage, setCurrentPage] = useState(1);

useEffect(() => {
  const fetchPuzzles = async () => {
    const response = await axios.get(
      `/puzzles?page=${currentPage}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    setPuzzles(response.data.data);
    setPagination(response.data.pagination);
  };
  
  fetchPuzzles();
}, [currentPage]);
```

---

## Performance Tips

1. **Use pagination for large datasets** - Always use page parameter when dealing with 1000+ items
2. **Cache results** - Cache frequently accessed pages on the frontend
3. **Batch updates wisely** - Don't run update operations during peak hours
4. **Monitor progress** - Use the `hasMore` flag to track progress
5. **Add delays** - Optional 100ms delay between page requests for batch operations

---

## Troubleshooting

### "No data returned"
- Check if page number is valid (1 to totalPages)
- Verify database has data

### "Updates not visible"
- Make sure to process all pages (check `hasMore` flag)
- Verify the update logic matches your data structure

### "Slow performance"
- Reduce batch size if needed (though 1000 is optimal)
- Check database indexes
- Monitor server memory usage


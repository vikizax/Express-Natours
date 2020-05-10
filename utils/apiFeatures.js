class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // copy of req.query
    const queryObj = { ...this.queryString };
    // key to remove from the copied obj
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // removes the exculdedFields
    excludedFields.forEach(el => delete queryObj[el]);

    // advance filter
    let queryStr = JSON.stringify(queryObj);
    // replace the operators with ${operator name}
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
    // generate new query with queryStr
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    // sort query is included in url
    if (this.queryString.sort) {
      // sort by the field provided
      const sortBy = this.queryString.sort.split(',').join(' ');
      // generate new query with sorted field
      this.query = this.query.sort(sortBy);
    } else {
      // default sort by created timestamp
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    // if fields query is provided in the url
    if (this.queryString.fields) {
      // get the fields from the url, replace ',' with space
      const fields = this.queryString.fields.split(',').join(' ');
      // generate new query with the required fields
      this.query = this.query.select(fields);
    } else {
      // default remove the '__v' field
      this.query = this.query.select('-__v');
    }
    return this;
  }

  pagination() {
    // default page 1 if page not provided
    const page = this.queryString.page * 1 || 1;
    // default limit 100 if limit is not provided
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    // generate new query with skip and limit -> paginate
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;

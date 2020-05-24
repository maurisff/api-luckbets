class ResponseInfo {
  constructor(success, data, pagination) {
    this.success = success;
    this.data = data;
    this.pagination = pagination;
  }

  success() {
    return this.success;
  }

  data() {
    return this.data;
  }
}
module.exports = ResponseInfo;

interface AwsEventModel {
  resource: string;
  path: string;
  httpMethod: string;
  headers: object;
  queryStringParameters: AWSEventQueryParamsModel;
  pathParameters: object;
  stageVariables: object;
  requestContext: any;
  body: string;
}

interface AWSEventQueryParamsModel {
  [x: string]: any;
}

export { AwsEventModel };

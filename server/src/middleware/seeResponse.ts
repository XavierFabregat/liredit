import { Request, Response, NextFunction } from "express";

export function logHeaders(_req: Request, res: Response, next: NextFunction) {
  // Capture the original 'res.send' function
  const originalSend = res.send;

  // Override the 'res.send' function
  res.send = function (body: any) {
    // Log the headers
    console.log("Response Headers:", res.getHeaders());

    // Call the original 'res.send' function
    return originalSend.call(this, body);
  };

  // Move to the next middleware
  next();
}

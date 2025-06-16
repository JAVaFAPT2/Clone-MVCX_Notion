package com.clone.notion.aspect;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StopWatch;

import java.util.Arrays;

@Aspect
@Component
public class ApiLoggingAspect {
    private static final Logger logger = LoggerFactory.getLogger(ApiLoggingAspect.class);

    /**
     * Pointcut for all controller methods
     */
    @Pointcut("within(@org.springframework.web.bind.annotation.RestController *)")
    public void controllerMethods() {}

    /**
     * Pointcut for all service methods
     */
    @Pointcut("within(@org.springframework.stereotype.Service *)")
    public void serviceMethods() {}

    /**
     * Log controller method execution time and parameters
     */
    @Around("controllerMethods()")
    public Object logControllerMethod(ProceedingJoinPoint joinPoint) throws Throwable {
        return logMethodExecution(joinPoint, "CONTROLLER");
    }

    /**
     * Log service method execution time and parameters
     */
    @Around("serviceMethods()")
    public Object logServiceMethod(ProceedingJoinPoint joinPoint) throws Throwable {
        return logMethodExecution(joinPoint, "SERVICE");
    }

    /**
     * Common method to log execution details
     */
    private Object logMethodExecution(ProceedingJoinPoint joinPoint, String type) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String className = signature.getDeclaringType().getSimpleName();
        String methodName = signature.getName();
        
        // Get method parameters
        String[] paramNames = signature.getParameterNames();
        Object[] paramValues = joinPoint.getArgs();
        
        // Create a StopWatch to measure execution time
        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        
        // Log method entry with parameters
        logger.debug("⏩ {} ENTRY: {}.{}({})", 
                type, 
                className, 
                methodName, 
                formatParameters(paramNames, paramValues));
        
        try {
            // Execute the method
            Object result = joinPoint.proceed();
            
            // Stop the timer
            stopWatch.stop();
            
            // Log method exit with result and execution time
            logger.debug("⏪ {} EXIT: {}.{} - Execution time: {} ms, Result: {}", 
                    type, 
                    className, 
                    methodName, 
                    stopWatch.getTotalTimeMillis(),
                    formatResult(result));
            
            return result;
        } catch (Throwable ex) {
            // Stop the timer
            stopWatch.stop();
            
            // Log method exception
            logger.error("❌ {} EXCEPTION: {}.{} - Execution time: {} ms, Exception: {}", 
                    type, 
                    className, 
                    methodName, 
                    stopWatch.getTotalTimeMillis(),
                    ex.getMessage());
            
            throw ex;
        }
    }

    /**
     * Format method parameters for logging
     */
    private String formatParameters(String[] paramNames, Object[] paramValues) {
        if (paramNames == null || paramNames.length == 0) {
            return "";
        }
        
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < paramNames.length; i++) {
            if (i > 0) {
                builder.append(", ");
            }
            builder.append(paramNames[i]).append("=");
            
            // Format the parameter value
            if (paramValues[i] == null) {
                builder.append("null");
            } else if (paramValues[i] instanceof String) {
                builder.append("\"").append(paramValues[i]).append("\"");
            } else if (paramValues[i].getClass().isArray()) {
                builder.append(Arrays.toString((Object[]) paramValues[i]));
            } else {
                builder.append(paramValues[i]);
            }
        }
        return builder.toString();
    }

    /**
     * Format method result for logging
     */
    private String formatResult(Object result) {
        if (result == null) {
            return "null";
        } else if (result instanceof String) {
            return "\"" + result + "\"";
        } else if (result.getClass().isArray()) {
            return Arrays.toString((Object[]) result);
        } else {
            String resultStr = result.toString();
            // Truncate very long results
            if (resultStr.length() > 100) {
                return resultStr.substring(0, 97) + "...";
            }
            return resultStr;
        }
    }
} 
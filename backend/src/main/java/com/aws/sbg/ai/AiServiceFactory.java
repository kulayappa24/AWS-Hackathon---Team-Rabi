package com.aws.sbg.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AiServiceFactory {

    private final ApplicationContext context;

    @Value("${app.ai.provider:local}")
    private String configuredProvider;

    public AiService getAiService() {
        if ("bedrock".equalsIgnoreCase(configuredProvider)) {
            return context.getBean("bedrockAiService", AiService.class);
        }
        return context.getBean("localAiService", AiService.class);
    }
}

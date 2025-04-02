setwd(dirname(rstudioapi::getActiveDocumentContext()$path))

require(pacman)
p_load(tidyverse, lme4, lmerTest, glmmTMB, performance, GGally, datasets, sjPlot, mgcv, ggstatsplot)
data_full <- read_csv("../sanityCheck_rawData/df_all_pilot_v2_19participants.csv")
dim(data_full)
head(data_full)

data_full$response_numeric <- ifelse(data_full$response == "j", 1, 0)
data_full <- data_full[!is.na(data_full$response), ]
data_full$dist_from_gt <- sqrt(
  (data_full$obstacle_choice_x - data_full$obstacle_groundTruth_x)^2 +
    (data_full$obstacle_choice_y - data_full$obstacle_groundTruth_y)^2
)

# Subset rows where choice is either "mid" or "lp"
df_mid_lp <- data_full[data_full$choice %in% c("mid", "lp"), ]

# Convert 'choice' to a factor with levels ordered as "lp" then "mid"
df_mid_lp$choice <- factor(df_mid_lp$choice, levels = c("lp", "mid"))
df_mid_lp$timeLimit <- factor(df_mid_lp$timeLimit)
df_mid_lp$subject_id <- factor(df_mid_lp$subject_id)

# Model 1: Full interaction: dist_from_gt + choice * timeLimit + random intercept per subject
model1 <- glmer(response_numeric ~ dist_from_gt + choice * timeLimit + (1 | subject_id),
                data = df_mid_lp, family = binomial(link = "logit"))

# Model 2: Main effects: dist_from_gt + choice + timeLimit + random intercept per subject
model2 <- glmer(response_numeric ~ dist_from_gt + choice + timeLimit + (1 | subject_id),
                data = df_mid_lp, family = binomial(link = "logit"))

# Model 3: No choice effect: dist_from_gt + timeLimit + random intercept per subject
model3 <- glmer(response_numeric ~ dist_from_gt + timeLimit + (1 | subject_id),
                data = df_mid_lp, family = binomial(link = "logit"))

# Model 4: No timeLimit effect: dist_from_gt + choice + random intercept per subject
model4 <- glmer(response_numeric ~ dist_from_gt + choice + (1 | subject_id),
                data = df_mid_lp, family = binomial(link = "logit"))


# Model 5: Distance only: dist_from_gt + random intercept per subject
model5 <- glmer(response_numeric ~ dist_from_gt + (1 | subject_id),
                data = df_mid_lp, family = binomial(link = "logit"))

# Model 6: model4 with a spline function
model6 <- gam(response_numeric ~ s(dist_from_gt) + choice + s(subject_id, bs = "re"),
              data = df_mid_lp, family = binomial(link = "logit"))

AIC(model1, model2, model3, model4, model5 , model6)
BIC(model1, model2, model3, model4, model5, model6)

anova(model1, model2, model4)
anova(model1, model4)
anova(model1, model2)
anova(model1, model2, model3, model5)
anova(model6, model4)
anova(model1, model2, model4, model5)
# Model 1 is the best model
summary(model1)

library(ggeffects)
library(ggplot2)
plot_model(model1, type = "pred", terms = c("dist_from_gt", "choice", "timeLimit"))

# Generate predictions over a range of distances, separately for each 'choice'
# Here, "dist_from_gt" will be varied and "choice" held at its levels.
pred <- ggpredict(model1, terms = c("dist_from_gt [all]", "choice", "timeLimit"))
p <- plot(pred)

# Customize the plot: change title, legend labels, and colors for 'choice'
p + 
  labs(title = "Predicted probabilities of Response_j", 
       color = "Probe Type", 
       fill = "Probe Type",
       x = "Distance from Ground Truth",
       y = "Predicted Probability of 'j'") +
  scale_color_manual(values = c("lp" = "lightblue", "mid" = "royalblue")) +
  scale_fill_manual(values = c("lp" = "lightblue", "mid" = "royalblue"))

# Plot the predicted probabilities - v1
ggplot(pred, aes(x = x, y = predicted, color = group)) +
  geom_line(size = 1.2) +
  geom_ribbon(aes(ymin = conf.low, ymax = conf.high, fill = group), 
              alpha = 0.2, color = NA) +
  labs(x = "Distance from Ground Truth",
       y = "Predicted Probability of 'j'",
       color = "Choice",
       fill = "Choice") +
  theme_minimal()

df_mid_lp$pred <- predict(model1)
ggplot(df_mid_lp, aes(x = dist_from_gt, y = pred, group = subject_id, color = subject_id)) +
  geom_line(alpha = 0.6) +
  facet_wrap(~ choice) +
  labs(x = "Distance from Ground Truth",
       y = "Predicted Probability of 'j'",
       title = "Subject-specific Predicted Probabilities (Original Data)") +
  theme_minimal() +
  theme(legend.position = "none")

## if subsetting to a shared range of dist_from_gt
df_sub <- df_mid_lp[df_mid_lp$dist_from_gt < 130, ]


# Model 1: Full interaction: dist_from_gt + choice * timeLimit + random intercept per subject
model1_s <- glmer(response_numeric ~ dist_from_gt + choice * timeLimit + (1 | subject_id),
                data = df_sub, family = binomial(link = "logit"))

# Model 2: Main effects: dist_from_gt + choice + timeLimit + random intercept per subject
model2_s <- glmer(response_numeric ~ dist_from_gt + choice + timeLimit + (1 | subject_id),
                data = df_sub, family = binomial(link = "logit"))

# Model 3: No choice effect: dist_from_gt + timeLimit + random intercept per subject
model3_s <- glmer(response_numeric ~ dist_from_gt + timeLimit + (1 | subject_id),
                data = df_sub, family = binomial(link = "logit"))

# Model 4: No timeLimit effect: dist_from_gt + choice + random intercept per subject
model4_s <- glmer(response_numeric ~ dist_from_gt + choice + (1 | subject_id),
                data = df_sub, family = binomial(link = "logit"))

# Model 5: Distance only: dist_from_gt + random intercept per subject
model5_s <- glmer(response_numeric ~ dist_from_gt + (1 | subject_id),
                data = df_sub, family = binomial(link = "logit"))

# Model 6: model4 with a spline function
model6_s <- gam(response_numeric ~ s(dist_from_gt) + choice + s(subject_id, bs = "re"),
              data = df_sub, family = binomial(link = "logit"))

AIC(model1_s, model2_s, model3_s, model4_s, model5_s, model6_s)
BIC(model1_s, model2_s, model3_s, model4_s, model5_s, model6_s)

anova(model1_s, model2_s, model4_s)
anova(model1_s, model4_s)
anova(model1_s, model2_s)
anova(model1_s, model2_s, model3_s, model5_s)
anova(model6_s, model4_s)
anova(model1_s, model2_s, model4_s, model5_s)
# Model 1_s is the best model
summary(model1_s)

# Generate predictions over a range of distances, separately for each 'choice'
# Here, "dist_from_gt" will be varied and "choice" held at its levels.
pred_s <- ggpredict(model1_s, terms = c("dist_from_gt [all]", "choice", "timeLimit"))
p_s <- plot(pred_s)

# Customize the plot: change title, legend labels, and colors for 'choice'
p_s + 
  labs(title = "Predicted probabilities of Response_j", 
       color = "Probe Type", 
       fill = "Probe Type",
       x = "Distance from Ground Truth",
       y = "Predicted Probability of 'j'") +
  scale_color_manual(values = c("lp" = "lightblue", "mid" = "royalblue")) +
  scale_fill_manual(values = c("lp" = "lightblue", "mid" = "royalblue"))

df_sub$pred <- predict(model1_s)
ggplot(df_sub, aes(x = dist_from_gt, y = pred, group = subject_id, color = subject_id)) +
  geom_line(alpha = 0.6) +
  facet_wrap(~ choice) +
  labs(x = "Distance from Ground Truth",
       y = "Predicted Probability of 'j'",
       title = "Subject-specific Predicted Probabilities (Original Data)") +
  theme_minimal() +
  theme(legend.position = "none")
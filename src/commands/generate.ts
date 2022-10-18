import { AttachmentBuilder, ButtonBuilder, Colors, EmbedBuilder, SlashCommandBooleanOption, SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandStringOption } from "discord.js";
import { Command } from "../classes/command";
import { CommandContext } from "../classes/commandContext";
import { GenerationInput, ModelGenerationInputStableToggles } from "../stable_horde_types";
import { Config } from "../types";
import {readFileSync} from "fs"
import { AutocompleteContext } from "../classes/autocompleteContext";

const config = JSON.parse(readFileSync("./config.json").toString()) as Config

const command_data = new SlashCommandBuilder()
    .setName("generate")
    .setDMPermission(false)
    .setDescription(`Generates an image with stable horde`)
    .addStringOption(
        new SlashCommandStringOption()
        .setName("prompt")
        .setDescription("The prompt to generate an image with")
        .setRequired(true)
    )
    .addStringOption(
        new SlashCommandStringOption()
        .setName("sampler")
        .setDescription("The sampler to use")
        .setChoices(
            ...Object.keys(ModelGenerationInputStableToggles).map(k => ({name: k, value: k}))
        )
    )
    .addIntegerOption(
        new SlashCommandIntegerOption()
        .setName("cfg")
        .setDescription("How strictly to follow the given prompt")
        .setMinValue(-40)
        .setMaxValue(30)
    )
    /*.addIntegerOption(
        new SlashCommandIntegerOption()
        .setName("denoise_percentage")
        .setDescription("How much to denoise in %")
        .setMinValue(0)
        .setMaxValue(100)
    )*/
    .addStringOption(
        new SlashCommandStringOption()
        .setName("seed")
        .setDescription("The seed to use")
    )
    .addIntegerOption(
        new SlashCommandIntegerOption()
        .setName("height")
        .setDescription("The height of the result image")
        .setMinValue(config.user_restrictions?.height?.min ?? 64)
        .setMaxValue(config.user_restrictions?.height?.max ?? 1024)
    )
    .addIntegerOption(
        new SlashCommandIntegerOption()
        .setName("width")
        .setDescription("How width of the result image")
        .setMinValue(config.user_restrictions?.width?.min ?? 64)
        .setMaxValue(config.user_restrictions?.width?.max ?? 1024)
    )
    .addBooleanOption(
        new SlashCommandBooleanOption()
        .setName("upscale")
        .setDescription("Whether to upscale the image")
    )
    .addBooleanOption(
        new SlashCommandBooleanOption()
        .setName("gfpgan")
        .setDescription("Whether to use gfpgan (face correction)")
    )
    .addBooleanOption(
        new SlashCommandBooleanOption()
        .setName("real_esrgan")
        .setDescription("Whether to use RealESRGAN")
    )
    .addBooleanOption(
        new SlashCommandBooleanOption()
        .setName("ldsr")
        .setDescription("Whether to use LDSR")
    )
    .addIntegerOption(
        new SlashCommandIntegerOption()
        .setName("seed_variation")
        .setDescription("(amount needs to be provided) increment for the seed on each image")
        .setMinValue(1)
        .setMaxValue(1000)
    )
    .addIntegerOption(
        new SlashCommandIntegerOption()
        .setName("steps")
        .setDescription("How many steps to go though while creating the image")
        .setMinValue(config.user_restrictions?.steps?.min ?? 1)
        .setMaxValue(config.user_restrictions?.steps?.max ?? 100)
    )
    .addIntegerOption(
        new SlashCommandIntegerOption()
        .setName("amount")
        .setDescription("How many images to generate")
        .setMinValue(1)
        .setMaxValue(config.user_restrictions?.amount?.max ?? 4)
    )
    if(config.user_restrictions?.allow_models) {
        command_data
        .addStringOption(
            new SlashCommandStringOption()
            .setName("model")
            .setDescription("The model to use for this generation")
            .setAutocomplete(true)
        )
    }

export default class extends Command {
    constructor() {
        super({
            name: "generate",
            command_data: command_data.toJSON(),
            staff_only: false,
        })
    }

    override async run(ctx: CommandContext): Promise<any> {
        const prompt = ctx.interaction.options.getString("prompt", true)
        const sampler = (ctx.interaction.options.getString("sampler") ?? ctx.client.config.default_sampler ?? ModelGenerationInputStableToggles.k_euler) as ModelGenerationInputStableToggles
        const cfg = ctx.interaction.options.getInteger("cfg") ?? ctx.client.config.default_cfg ?? 5
        //const denoise = (ctx.interaction.options.getInteger("denoise_percentage") ?? 0)/100
        const seed = ctx.interaction.options.getString("seed")
        const height = ctx.interaction.options.getInteger("height") ?? ctx.client.config.default_res?.height ?? 512
        const width = ctx.interaction.options.getInteger("width") ?? ctx.client.config.default_res?.width ?? 512
        const upscale = !!ctx.interaction.options.getBoolean("upscale")
        const gfpgan = !!ctx.interaction.options.getBoolean("gfpgan")
        const real_esrgan = !!ctx.interaction.options.getBoolean("real_esrgan")
        const ldsr = !!ctx.interaction.options.getBoolean("ldsr")
        const seed_variation = ctx.interaction.options.getInteger("seed_variation") ?? 1
        const steps = ctx.interaction.options.getInteger("steps") ?? ctx.client.config.default_steps ?? 30
        const amount = ctx.interaction.options.getInteger("amount") ?? 1
        const model = ctx.interaction.options.getString("model")

        if(height % 64 !== 0) return ctx.error({error: "Height must be a multiple of 64"})
        if(width % 64 !== 0) return ctx.error({error: "Width must be a multiple of 64"})
        if(model && ctx.client.config.blacklisted_models?.includes(model)) return ctx.error({error: "This model is blacklisted"})
        if(model && model !== "YOLO" && !(await ctx.api_manager.getStatusModels()).find(m => m.name === model)) return ctx.error({error: "Unable to find this model"})

        const token = await ctx.api_manager.getUserToken(ctx.interaction.user.id) || ctx.client.config.default_token || "0000000000"

        const generation_data: GenerationInput = {
            prompt,
            params: {
                toggles: [1, 4],
                sampler_name: sampler,
                cfg_scale: cfg,
                seed: seed ?? undefined,
                height,
                width,
                seed_variation,
                use_gfpgan: gfpgan,
                use_ldsr: ldsr,
                use_real_esrgan: real_esrgan,
                use_upscaling: upscale,
                steps,
                n: amount,
                // this makes the workers get stuck
                //denoising_strength: denoise
            },
            nsfw: ctx.client.config.allow_nsfw,
            censor_nsfw: ctx.client.config.censor_nsfw,
            trusted_workers: ctx.client.config.trusted_workers,
            workers: ctx.client.config.workers,
            models: !model ? undefined : model === "YOLO" ? [] : [model]
        }

        if(ctx.client.config.dev) {
            console.log(token)
            console.log(generation_data)
        }
        await ctx.interaction.deferReply({
            //ephemeral: true
        })

        const generation_start = await ctx.api_manager.postAsyncGeneration(generation_data, token).catch((e) => ctx.client.config.dev ? console.error(e) : null)
        if(!generation_start?.id) return ctx.error({error: "Unable to start generation"})
        const start_status = await ctx.api_manager.getGenerateCheck(generation_start.id!).catch((e) => ctx.client.config.dev ? console.error(e) : null);
        const start_horde_data = await ctx.api_manager.getStatusPerformance()

        if(ctx.client.config.dev) {
            console.log(start_status)
        }

        const embed = new EmbedBuilder({
            color: Colors.Blue,
            title: "Generation started",
            description: `Position: \`${start_status?.queue_position}\`/\`${start_horde_data.queued_requests}\`
\`${start_status?.waiting}\`/\`${amount}\` Images currently waiting
\`${start_status?.processing}\`/\`${amount}\` Images currently processing
\`${start_status?.finished}\`/\`${amount}\` Images finished
ETA: <t:${Math.floor(Date.now()/1000)+(start_status?.wait_time ?? 0)}:R>`,
        })

        const login_embed = new EmbedBuilder({
            color: Colors.Red,
            title: "You are not logged in",
            description: `This will make your requests appear anonymous.\nThis can result in low generation speed due to low priority.\nLog in now with ${await ctx.client.getSlashCommandTag("login")}\n\nDon't know what the token is?\nCreate a stable horde account here: https://stablehorde.net/register`
        })

        if(ctx.client.config.dev) embed.setFooter({text: generation_start.id})

        const btn = new ButtonBuilder({
            label: "Cancel",
            custom_id: `cancel_gen_${generation_start.id}`,
            style: 4
        })
        const components = [{type: 1,components: [btn.toJSON()]}]

        ctx.interaction.editReply({
            content: "",
            embeds: token === (ctx.client.config.default_token ?? "0000000000") ? [embed.toJSON(), login_embed.toJSON()] : [embed.toJSON()],
            components
        })

        const message = await ctx.interaction.fetchReply()

        let done = false

        let error_timeout = Date.now()*2
        let prev_left = 1

        const inter = setInterval(async () => {
            const status = await ctx.api_manager.getGenerateCheck(generation_start.id!).catch((e) => ctx.client.config.dev ? console.error(e) : null);
            const horde_data = await ctx.api_manager.getStatusPerformance()

            if(!status || (status as any).faulted) {
                clearInterval(inter);
                return message.edit({content: "Image generation has been cancelled", embeds: []});
            }

            if(ctx.client.config.dev) {
                console.log(status)
            }


            if(status?.wait_time === 0 && prev_left !== 0) error_timeout = Date.now()
            prev_left = status?.wait_time ?? 1


            if(error_timeout < (Date.now()-1000*60*2)) {
                await ctx.api_manager.deleteGenerateStatus(generation_start.id!)
                message.edit({
                    components: [],
                    content: "Generation cancelled due to errors",
                    embeds: []
                })
                clearInterval(inter)
                return;
            }

            done = status.done

            if(done) {
                const images = await ctx.api_manager.getGenerateStatus(generation_start.id!)

                const image_map = images.generations.map((g, i) => {
                    const attachment = new AttachmentBuilder(Buffer.from(g.img!, "base64"), {name: `${g.seed ?? `image${i}`}.webp`})
                    const embed = new EmbedBuilder({
                        title: `Image ${i+1}`,
                        image: {url: `attachment://${g.seed ?? `image${i}`}.webp`},
                        color: Colors.Blue,
                        description: `Seed: ${g.seed}\nModel: ${g.model}`
                    })
                    return {attachment, embed}
                })
                clearInterval(inter);
                return message.edit({content: "Image generation finished", embeds: image_map.map(i => i.embed), files: image_map.map(i => i.attachment), components: []});
            }
            
            const embed = new EmbedBuilder({
                color: Colors.Blue,
                title: "Generation started",
                description: `Position: \`${status.queue_position}\`/\`${horde_data.queued_requests}\`
\`${status.waiting}\`/\`${amount}\` Images currently waiting
\`${status.processing}\`/\`${amount}\` Images currently processing
\`${status.finished}\`/\`${amount}\` Images finished
ETA: <t:${Math.floor(Date.now()/1000)+status.wait_time}:R>`
            })

            if(ctx.client.config.dev) embed.setFooter({text: generation_start?.id ?? "Unknown ID"})

            let embeds = token === (ctx.client.config.default_token ?? "0000000000") ? [embed.toJSON(), login_embed.toJSON()] : [embed.toJSON()]

            if(status.wait_time > 60 * 2) {
                embeds.push(new EmbedBuilder({
                    color: Colors.Yellow,
                    title: "Stable Horde currently is under high load",
                    description: "You can contribute your GPUs processing power to the project.\nRead more: https://stablehorde.net/"
                }).toJSON())
            }

            return message.edit({
                content: "",
                embeds,
                components
            })
        }, 1000 * (ctx.client.config?.update_generation_status_interval_seconds || 5))
    }

    override async autocomplete(context: AutocompleteContext): Promise<any> {
        const option = context.interaction.options.getFocused(true)
        switch(option.name) {
            case "model": {
                const models = await context.api_manager.getStatusModels()
                if(context.client.config.dev) console.log(models)
                context.interaction.respond([{name: "Any Model", value: "YOLO"}, ...models.sort((a, b) => b.performance!-a.performance!).map(m => ({name: `${m.name} | Workers: ${m.count} | Performance: ${m.performance}`, value: m.name!}))])
            }
        }
    }
}
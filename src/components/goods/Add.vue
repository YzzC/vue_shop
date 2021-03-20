<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">Home</el-breadcrumb-item>
            <el-breadcrumb-item>Goods Management</el-breadcrumb-item>
            <el-breadcrumb-item>Add Goods</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 提示区域 -->
            <el-alert title="Add goods info" type="info" center show-icon :closable="false">
            </el-alert>
            <!-- 步骤条 -->
            <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
                <el-step title="Info"></el-step>
                <el-step title="Params"></el-step>
                <el-step title="Attributes"></el-step>
                <el-step title="Pics"></el-step>
                <el-step title="Content"></el-step>
                <el-step title="Finish"></el-step>
            </el-steps>

            <!-- tab栏 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
                <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTabLeave"
                    @tab-click="tabClicked">
                    <el-tab-pane label="Info" name="0">
                        <el-form-item label="Name" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="Price" prop="goods_price">
                            <el-input v-model="addForm.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="Weight" prop="goods_weight">
                            <el-input v-model="addForm.goods_weight" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="Number" prop="goods_number">
                            <el-input v-model="addForm.goods_number" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="Category" prop="goods_cat">
                            <el-cascader v-model="addForm.goods_cat" :options="catelist" :props="{expandTrigger: 'hover',value:'cat_id',
                            label:'cat_name',
                            children:'children',
                            checkStrictly:'true'}" @change="handleChange"></el-cascader>
                        </el-form-item>
                    </el-tab-pane>

                    <el-tab-pane label="Params" name="1">
                        <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
                            <!-- 复选框组 -->
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>

                    <el-tab-pane label="Attributes" name="2">
                        <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>

                    <el-tab-pane label="Pics" name="3">
                        <!-- action：图片要上传的api地址 -->
                        <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove"
                            list-type="picture" :headers="headerObj" :on-success="handleSuccess">
                            <el-button size="small" type="primary">Upload</el-button>
                        </el-upload>
                    </el-tab-pane>

                    <el-tab-pane label="Content" name="4">
                        <!-- 富文本编辑器 -->
                        <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                        <!-- 添加商品按钮 -->
                        <el-button type="primary" class="btnAdd" @click="add">Add goods</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>

        <!-- 图片预览 -->
        <el-dialog title="Preview" :visible.sync="previewVisible" width="50%">
            <img :src="previewPath" alt="" class="previewImg">
        </el-dialog>
    </div>
</template>

<script>
    import _ from 'lodash'
    export default {
        data() {
            return {
                activeIndex: '0',
                //添加商品的表单对象
                addForm: {
                    goods_name: '',
                    goods_price: 0,
                    goods_weight: 0,
                    goods_number: 0,
                    goods_cat: [],
                    pics: [],
                    goods_introduce:'',
                    attrs:[],
                },
                addFormRules: {
                    goods_name: [
                        { required: true, message: 'Please enter name', trigger: 'blur' }
                    ],
                    goods_price: [
                        { required: true, message: 'Please enter price', trigger: 'blur' }
                    ],
                    goods_weight: [{ required: true, message: 'Please enter weight', trigger: 'blur' }
                    ],
                    goods_number: [{ required: true, message: 'Please enter number', trigger: 'blur' }
                    ],
                    goods_cat: [{ required: true, message: 'Please enter categories', trigger: 'blur' }
                    ],
                },
                //商品分类列表
                catelist: [],
                //动态参数列表数组
                manyTableData: [],
                //静态属性列表数组
                onlyTableData: [],
                //上传图片的URL
                uploadURL: 'http://www.ysqorz.top:8888/api/private/v1/upload',
                //图片上传组件的headers请求头
                headerObj: {
                    Authorization: window.sessionStorage.getItem('Token')
                },
                previewPath: '',
                previewVisible:false,
            }
        },
        created() {
            this.getCateList()
        },
        methods: {
            //获取所有商品分类数据
            async getCateList() {
                const { data: res } = await this.$http.get('categories')

                if (res.meta.status !== 200) {
                    return this.$message.error('Fail to get categories')
                }
                this.catelist = res.data
                console.log(this.catelist)
            },
            //级连选择器选中项变化，触发函数
            handleChange() {
                if (this.addForm.goods_cat.length !== 3) {
                    this.addForm.goods_cat = []
                }
            },
            beforeTabLeave(activeName, oldActiveName) {
                if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
                    return this.$message.error('Please choose category first!')
                    return false
                }
            },
            async tabClicked() {
                //访问动态参数面板
                if (this.activeIndex === '1') {
                    const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
                        params: { sel: 'many' }
                    })
                    if (res.meta.status !== 200) {
                        return this.$message.error('Fail to get params')
                    }
                    res.data.forEach(item => {
                        item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
                    })
                    this.manyTableData = res.data
                } else if (this.activeIndex === '2') {
                    const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
                        params: { sel: 'only' }
                    })
                    if (res.meta.status !== 200) {
                        return this.$message.error('Fail to get attributes')
                    }
                    this.onlyTableData = res.data
                }
            },
            //图片预览效果
            handlePreview(file) {
                console.log(file)
                this.previewPath = file.url
                this.previewVisible=true
            },
            //移除图片的操作
            handleRemove(file) {
                //获得将要删除的图片的临时路径
                const filePath = file.response.data.tmp_path
                //从pics数组中，找到这个图片的索引
                const i = this.addForm.pics.findIndex(x => x.pic === filePath)
                //调用数组的splice方法，把图片信息对象，从pics数组中移除
                this.addForm.pics.splice(i, 1)
                console.log(this.addForm)
            },
            //监听图片上传成功的事件
            handleSuccess(response) {
                //拼接得到一个图片信息对象
                const picInfo = { pics: response.data.tmp_path }
                //将图片信息对象push到pics数组中
                this.addForm.pics.push(picInfo)
                console.log(this.addForm)

            },
            //添加商品
            add(){
                this.$refs.addFormRef.validate(async valid=>{
                    if(!valid){
                        return this.$message.error('Please enter content')
                    }
                    //添加
                    //lodash cloneDeep(obj)
                    const form = _.cloneDeep(this.addForm)
                    form.goods_cat = form.goods_cat.join(',')
                    //处理动态参数 
                    this.manyTableData.forEach(item=>{
                        const newInfo = {
                            attr_id: item.attr_id,
                            attr_value: item.attr_vals.join(' ')
                        }
                        this.addForm.attrs.push(newInfo)
                    })
                    //静态属性
                    this.onlyTableData.forEach(item=>{
                        const newInfo = {
                            attr_id: item.attr_id,
                            attr_value: item.attr_vals
                        }
                        this.addForm.attrs.push(newInfo)
                    })

                    form.attrs=this.addForm.attrs
                    console.log(form)

                    //发起请求，添加商品，商品名称必须是唯一的
                    const {data:res} = await this.$http.post(`goods`,form)

                    if(res.meta.status !==201){
                        return this.$message.error('Fail to add goods')
                    }
                    this.$message.success('Add goods succeed')
                    this.$router.push(`/goods`)
                })
            },
        },
        computed: {
            cateId() {
                if (this.addForm.goods_cat.length === 3) {
                    return this.addForm.goods_cat[2]
                }
                return null
            },
        }
    }
</script>

<style lang="less" scoped>
    .el-checkbox {
        /* 上右下左 */
        margin: 0 10px 0 0 !important;
    }
    .previewImg{
        width: 100%;
    }
    .btnAdd{
        margin-top: 15px;
    }
</style>
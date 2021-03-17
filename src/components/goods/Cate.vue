<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">Home</el-breadcrumb-item>
            <el-breadcrumb-item>Products Management</el-breadcrumb-item>
            <el-breadcrumb-item>Products Categories</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">Add categories</el-button>
                </el-col>
            </el-row>
        </el-card>

        <!-- 添加分类 对话框 -->
        <el-dialog title="Add category" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
            <!-- 添加分类的表单 -->
            <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
                <el-form-item label="Catergory" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="Parents">
                    <!-- options数据源 -->
                    <!-- props指定 配置对象 -->
                    <el-cascader v-model="selectedKeys" :options="parentCateList" :props="{expandTrigger: 'hover',value:'cat_id',
                    label:'cat_name',
                    children:'children',
                    checkStrictly:'true'}"
                    @change="parentCateChange"
                    clearable></el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">Cancel</el-button>
                <el-button type="primary" @click="addCate">Confirm</el-button>
            </span>
        </el-dialog>

        <!-- 表格 -->
        <tree-table :data="catelist" class="treeTable" :columns="columns" :selection-type="false" :expand-type="false"
            show-index index-text="#" border :show-row-hover="false">
            <!-- 是否有效 -->
            <template slot="isOk" slot-scope="scope">
                <i class="el-icon-success" style="color: lightgreen" v-if="scope.row.cat_deleted === false"></i>
            </template>
            <!-- 排序order -->
            <template slot="order" slot-scope="scope">
                <el-tag size="mini" v-if="scope.row.cat_level === 0">Tag 1</el-tag>
                <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">Tag 2</el-tag>
                <el-tag type="warning" size="mini" v-else>Tag 3</el-tag>
            </template>
            <!-- 操作opt -->
            <template slot="opt" slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini">Edit</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini">Delete</el-button>
            </template>
        </tree-table>

        <!-- 分页区 -->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
            :current-page="querInfo.pagenum" :page-sizes="[3, 5, 10, 15]" :page-size="querInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper" :total="total">
        </el-pagination>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                //商品分类数据列表，默认为空
                catelist: [],
                querInfo: {
                    type: 3,
                    pagenum: 1,
                    pagesize: 5,
                },
                //总数据条数
                total: 0,
                //为table制定列
                columns: [
                    {
                        label: 'Category name',
                        prop: 'cat_name'
                    }, {
                        label: 'Effective',
                        //表示，将当前列定义为模版列
                        type: 'template',
                        template: 'isOk'
                    }, {
                        label: 'Order',
                        type: 'template',
                        template: 'order'
                    }, {
                        label: 'Operation',
                        type: 'template',
                        template: 'opt'
                    }
                ],
                //控制添加分类对话框的显示与隐藏
                addCateDialogVisible: false,
                //添加分类的表单数据对象
                addCateForm: {
                    //将要添加的分类名称
                    cat_name: '',
                    //父级分类的id
                    cat_pid: 0,
                    //分类等级,m默认添加为一级分类
                    cat_level: 0
                },
                //添加分类表单的验证规则对象
                addCateFormRules: {
                    cat_name: [
                        { required: true, message: 'Please enter category', tigger: 'blur' }
                    ]
                },
                //父级分类的列表
                parentCateList: [],
                //指定级连选择器的配置对象
                // cascaderProps:{
                //     value:'cat_id',
                //     label:'cat_name',
                //     children:'children'
                // },
                //选中的父级分类的id数组
                selectedKeys:[],
            }
        },
        created() {
            this.getCateList()
        },
        methods: {
            //获取商品分类数据
            async getCateList() {
                const { data: res } = await this.$http.get('categories', { params: this.querInfo })
                if (res.meta.status !== 200) {
                    return this.$message.error('Fail to get categories')
                }
                //把数据列表，赋值给catelist
                this.catelist = res.data.result
                //把总数据条数赋值给total
                this.total = res.data.total
            },
            //监听page size改变的事件
            handleSizeChange(newSize) {
                this.querInfo.pagesize = newSize
                this.getCateList()
            },
            //监听pagenum改变的事件
            handleCurrentChange(newPage) {
                this.querInfo.pagenum = newPage
                this.getCateList()
            },
            //点击按钮，展示添加分类的对话框
            showAddCateDialog() {
                //先获取父级分类的列表，再展示对话框
                this.getParentCateList()
                this.addCateDialogVisible = true
            },
            //获取父级分类数据列表
            async getParentCateList() {
                const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
                if (res.meta.status !== 200) {
                    return this.$message.error('Fail to get parent category')
                }
                this.parentCateList = res.data
            },
            //选择项发生变化触发这个函数
            parentCateChange(){
                console.log(this.selectedKeys)
                //如果selectedKeys数组中的length大于0，证明宣政的父级分类
                //反之，就说明没有选中任何父级分类
                if(this.selectedKeys.length > 0){
                    //父级分类的id
                    this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
                    //为当前分类的等级赋值
                    this.addCateForm.cat_level = this.selectedKeys.length
                    return
                }else{
                    this.addCateForm.cat_pid = 0
                    this.addCateForm.cat_level = 0
                }
            },
            //点击按钮，添加新的分类
            addCate(){
                this.$refs.addCateFormRef.validate(async valid =>{
                    if(!valid) return 
                    const {data:res} = await this.$http.post('categories', this.addCateForm)

                    if(res.meta.status !== 201){
                        return this.$message.error('Fail to add categories')
                    }

                    this.$message.success('Add categories succeed')
                    this.getCateList()
                    this.addCateDialogVisible=false
                })
            },
            //监听对话框的关闭事件，重置表单数据
            addCateDialogClosed(){
                this.$refs.addCateFormRef.resetFields()
                this.selectedKeys=[]
                this.addCateForm.cat_level =0
                this.addCateForm.cat_pid =0
            },
        }
    }
</script>

<style lang="less" scoped>
    .treeTable {
        margin-top: 15px;
    }
    .el-cascader {
        width:100%
    }
</style>